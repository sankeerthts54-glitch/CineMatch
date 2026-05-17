/* eslint-env node */
import dotenv from 'dotenv';
import mockDb from '../src/data/mockDb.js';

dotenv.config();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY;

export default async function handler(req, res) {
  // CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: "Query is required" });
    let movies = [];
    let isRateLimited = false;

    if (GEMINI_API_KEY) {
      try {
        const prompt = `You are a movie recommendation engine. The user enjoyed the movie "${query}". 
Suggest exactly 6 similar movies they would love. For EACH movie, return a JSON object with these exact fields:
- id (number, 1 through 6)
- title (string, the movie title)
- year (number, release year)
- director (string, primary director's name)
- runtime (string, formatted like "2h 15m")
- genres (array of strings, pick from: Action, Thriller, Drama, Comedy, Horror, Sci-Fi, Fantasy, Animation, Crime, Mystery, Adventure, Romance, Biography)
- rating (number, IMDb-style rating out of 10, one decimal)
- description (string, 2-3 sentences describing the plot WITHOUT spoilers)
- review (string, one punchy sentence critic-style review)
- reason (string, short phrase explaining WHY this is similar to "${query}")

Return ONLY a valid JSON array of 6 objects. Do not include markdown code blocks or any other text.`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        
        const geminiRes = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          }),
        });

        if (!geminiRes.ok) {
          if (geminiRes.status === 429) isRateLimited = true;
          throw new Error(`Gemini status ${geminiRes.status}`);
        }

        const data = await geminiRes.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) throw new Error("No text content in API response");

        let raw = textContent.trim();
        raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
        movies = JSON.parse(raw);

        if (!Array.isArray(movies) || movies.length === 0) {
          throw new Error("API returned invalid movie data");
        }
      } catch (e) {
        console.warn("Gemini fetch failed:", e.message);
        if (isRateLimited) {
           return res.status(429).json({ error: "Rate limited" });
        }
        // Fallback to mock data if Gemini fails
        const lowerQuery = query.toLowerCase();
        if (mockDb[lowerQuery]) {
           // Deep copy so we don't mutate the original mockDb
           movies = JSON.parse(JSON.stringify(mockDb[lowerQuery]));
        } else {
           return res.status(500).json({ error: e.message || "Failed to fetch recommendations" });
        }
      }
    } else {
      // If no key, fallback to mock data immediately
      const lowerQuery = query.toLowerCase();
      if (mockDb[lowerQuery]) {
         movies = JSON.parse(JSON.stringify(mockDb[lowerQuery]));
      } else {
         return res.status(500).json({ error: "Gemini API key not configured on server" });
      }
    }

    if (TMDB_API_KEY) {
      const fetchWithRetry = async (url, retries = 2) => {
        for (let i = 0; i <= retries; i++) {
          try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
          } catch (err) {
            if (i === retries) throw err;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      };

      for (const movie of movies) {
        try {
          let tmdbData = await fetchWithRetry(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&primary_release_year=${movie.year}`);
          
          if (!tmdbData || !tmdbData.results || tmdbData.results.length === 0) {
            // Fallback: search without strict year, as AI years often differ from TMDB by 1 year (premiere vs release)
            tmdbData = await fetchWithRetry(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}`);
          }
          
          if (tmdbData.results && tmdbData.results.length > 0) {
            const topResult = tmdbData.results[0];
            if (topResult.poster_path) {
              movie.posterUrl = `https://image.tmdb.org/t/p/w500${topResult.poster_path}`;
            }

            const detailsData = await fetchWithRetry(`https://api.themoviedb.org/3/movie/${topResult.id}?api_key=${TMDB_API_KEY}&append_to_response=videos,watch/providers`);

            if (detailsData.videos?.results) {
              const trailer = detailsData.videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
              if (trailer) movie.trailerKey = trailer.key;
            }

            if (detailsData["watch/providers"]?.results?.US?.flatrate) {
              movie.providers = detailsData["watch/providers"].results.US.flatrate.slice(0, 3).map((p) => ({
                name: p.provider_name,
                logo: `https://image.tmdb.org/t/p/w200${p.logo_path}`
              }));
            }
          }
        } catch (e) {
          console.error("TMDB Fetch Error for", movie.title, e);
        }
      }
    }

    res.json(movies);
  } catch (error) {
    console.error("Recommend Error:", error);
    res.status(500).json({ error: error.message });
  }
}

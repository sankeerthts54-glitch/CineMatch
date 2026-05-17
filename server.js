import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mockDb from './src/data/mockDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7860;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY;

// API: Autocomplete
app.get('/api/autocomplete', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ results: [] });
    if (!TMDB_API_KEY) return res.json({ results: [] }); // Graceful fallback

    const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=1`);
    const data = await tmdbRes.json();
    res.json(data);
  } catch (error) {
    console.error("Autocomplete Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Recommend
app.post('/api/recommend', async (req, res) => {
  try {
    const { query } = req.body;
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
      await Promise.all(
        movies.map(async (movie) => {
          try {
            const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&primary_release_year=${movie.year}`);
            const tmdbData = await searchRes.json();
            
            if (tmdbData.results && tmdbData.results.length > 0) {
              const topResult = tmdbData.results[0];
              if (topResult.poster_path) {
                movie.posterUrl = `https://image.tmdb.org/t/p/w500${topResult.poster_path}`;
              }

              const detailsRes = await fetch(`https://api.themoviedb.org/3/movie/${topResult.id}?api_key=${TMDB_API_KEY}&append_to_response=videos,watch/providers`);
              const detailsData = await detailsRes.json();

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
        })
      );
    }

    res.json(movies);
  } catch (error) {
    console.error("Recommend Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

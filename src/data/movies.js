// src/data/movies.js
// Uses Google Gemini API for real-time movie recommendations
// Falls back to local mock database if the API fails

import db from "./mockDb";

export const ALL_GENRES = [
  "All", "Action", "Thriller", "Drama", "Comedy",
  "Horror", "Sci-Fi", "Fantasy", "Animation",
  "Crime", "Mystery", "Adventure", "Romance", "Biography",
];

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Call the Google Gemini API to generate movie recommendations.
 */
async function callGeminiAPI(query) {
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

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`API ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // Extract the text content from Gemini's response
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error("No text content in API response");
  }

  // Parse the JSON array from the response
  let raw = textContent.trim();

  // Strip markdown code fences if present
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const movies = JSON.parse(raw);

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new Error("API returned invalid movie data");
  }

  // Fetch TMDB posters for each movie
  const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
  if (tmdbKey) {
    await Promise.all(
      movies.map(async (movie) => {
        try {
          // 1. Search for the movie to get TMDB ID and poster
          const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie.title)}&primary_release_year=${movie.year}`);
          const tmdbData = await res.json();
          
          if (tmdbData.results && tmdbData.results.length > 0) {
            const topResult = tmdbData.results[0];
            
            if (topResult.poster_path) {
              movie.posterUrl = `https://image.tmdb.org/t/p/w500${topResult.poster_path}`;
            }

            // 2. Fetch details for trailers and providers
            const detailsRes = await fetch(`https://api.themoviedb.org/3/movie/${topResult.id}?api_key=${tmdbKey}&append_to_response=videos,watch/providers`);
            const detailsData = await detailsRes.json();

            // Extract Trailer
            if (detailsData.videos?.results) {
              const trailer = detailsData.videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
              if (trailer) {
                movie.trailerKey = trailer.key;
              }
            }

            // Extract US Streaming Providers
            if (detailsData["watch/providers"]?.results?.US?.flatrate) {
              movie.providers = detailsData["watch/providers"].results.US.flatrate.slice(0, 3).map((p) => ({
                name: p.provider_name,
                logo: `https://image.tmdb.org/t/p/w200${p.logo_path}`
              }));
            }
          }
        } catch (e) {
          console.error("Failed to fetch TMDB data for", movie.title, e);
        }
      })
    );
  }

  return movies;
}

/**
 * Try to find recommendations in the local mock database.
 */
function searchMockDb(query) {
  const normalizedQuery = query.trim().toLowerCase();

  // Exact key match
  if (db[normalizedQuery]) return db[normalizedQuery];

  // Partial match
  for (const key of Object.keys(db)) {
    if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
      return db[key];
    }
  }

  // Word-level matching
  for (const key of Object.keys(db)) {
    const queryWords = normalizedQuery.split(/\s+/);
    const keyWords = key.split(/\s+/);
    const hasOverlap = queryWords.some(
      (w) => w.length > 2 && keyWords.some((kw) => kw.includes(w) || w.includes(kw))
    );
    if (hasOverlap) return db[key];
  }

  return null; // No match found in mock DB
}

/**
 * Search for movie recommendations.
 * Strategy:
 *   1. Try the Gemini API first (works for ANY movie)
 *   2. If API fails, fall back to local mock database
 *   3. If mock DB also has no match, return a random mock set
 */
export async function searchMovies(query) {
  if (!query.trim()) return [];

  // Try the API first
  if (API_KEY) {
    try {
      const apiResults = await callGeminiAPI(query);
      return apiResults;
    } catch (err) {
      console.warn("Gemini API failed, falling back to mock DB:", err.message);

      // Re-throw auth/rate-limit errors so the UI can show specific messages
      if (err.message.includes("401") || err.message.includes("429")) {
        throw err;
      }
    }
  }

  // Fallback: try mock database
  const mockResults = searchMockDb(query);
  if (mockResults) return mockResults;

  // Final fallback: random mock set
  const keys = Object.keys(db);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return db[randomKey];
}

/* eslint-env node */
import dotenv from 'dotenv';
dotenv.config();

const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY;

export default async function handler(req, res) {
  // CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
}

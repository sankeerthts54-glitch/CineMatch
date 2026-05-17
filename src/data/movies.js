// src/data/movies.js
// Uses Google Gemini API for real-time movie recommendations
// Falls back to local mock database if the API fails

import db from "./mockDb";

export const ALL_GENRES = [
  "All", "Action", "Thriller", "Drama", "Comedy",
  "Horror", "Sci-Fi", "Fantasy", "Animation",
  "Crime", "Mystery", "Adventure", "Romance", "Biography",
];

/**
 * Call the local backend API to generate movie recommendations securely.
 */
async function fetchFromBackend(query) {
  const response = await fetch('/api/recommend', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Backend error: ${response.status}`);
  }

  return await response.json();
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

  // Try the backend API first
  try {
    const apiResults = await fetchFromBackend(query);
    return apiResults;
  } catch (err) {
    console.warn("Backend API failed, falling back to mock DB:", err.message);

    // Re-throw auth/rate-limit errors so the UI can show specific messages
    if (err.message.includes("401") || err.message.includes("429")) {
      throw err;
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

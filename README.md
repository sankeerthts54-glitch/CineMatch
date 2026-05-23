---
title: CineMatch
emoji: 🎬
colorFrom: purple
colorTo: indigo
sdk: docker
pinned: false
---

# CineMatch

CineMatch is a premium movie recommendation application that uses the Gemini API to suggest films based on natural language input, and the TMDB API to enrich those recommendations with beautiful posters, trailers, and streaming provider data.

## Features

- **AI-Powered Recommendations:** Powered by Google's Gemini.
- **Dynamic Cinematic UI:** High-contrast, premium dark mode.
- **Rich Metadata:** Real-time posters and streaming links via TMDB.
- **Secure Backend:** Full-stack Express server protecting API keys.

## Environment Variables (Secrets)

Set these in your Space's **Settings → Variables and secrets**:
- `VITE_GEMINI_API_KEY` — Your Google Gemini API key
- `VITE_TMDB_API_KEY` — Your TMDB API key

## Local Development

1. Run `npm install`
2. Create a `.env` file with `VITE_GEMINI_API_KEY` and `VITE_TMDB_API_KEY`.
3. Run `npm run dev` to start both the Vite frontend and the proxy server.

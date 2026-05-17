# CineMatch

CineMatch is a premium movie recommendation application that uses the Gemini API to suggest films based on natural language input, and the TMDB API to enrich those recommendations with beautiful posters, trailers, and streaming provider data.

## Features

- **AI-Powered Recommendations:** Powered by Google's Gemini.
- **Dynamic Cinematic UI:** High-contrast, premium dark mode.
- **Rich Metadata:** Real-time posters and streaming links via TMDB.
- **Secure Backend:** Full-stack architecture protecting API keys using Vercel Serverless Functions.

## Local Development

1. Run `npm install`
2. Create a `.env` file with `VITE_GEMINI_API_KEY` and `VITE_TMDB_API_KEY`.
3. Run `npm run dev` to start both the Vite frontend and the proxy server.

## Vercel Deployment

This project is fully configured for deployment on **Vercel** using Serverless Functions.

1. Push your code to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import this repository. Vercel will automatically detect the Vite React framework.
4. Open the **Environment Variables** section and add:
   - `VITE_GEMINI_API_KEY`
   - `VITE_TMDB_API_KEY`
5. Click **Deploy**. Vercel will automatically use `api/index.js` for the backend and serve the React frontend globally.

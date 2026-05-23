---
title: CineMatch
emoji: 🎬
colorFrom: purple
colorTo: indigo
sdk: docker
pinned: false
---

<div align="center">

# 🎬 CineMatch

**AI-powered movie recommendations, beautifully presented.**

[![Live Demo](https://img.shields.io/badge/▲%20Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)](https://cinematch-lime.vercel.app)
[![HF Space](https://img.shields.io/badge/🤗%20Hugging%20Face-Space-yellow?style=for-the-badge)](https://huggingface.co/spaces/Vader26/cinematch)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/sankeerthts54-glitch/CineMatch)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat-square&logo=google)
![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?style=flat-square)

</div>

---

## ✨ What is CineMatch?

CineMatch is a **full-stack movie recommendation app** powered by Google's Gemini AI. Just type a movie you loved, and CineMatch instantly surfaces 6 handpicked recommendations — complete with posters, trailers, streaming availability, ratings, and a punchy critic-style review for each.

No generic suggestions. No endless scrolling. Just smart, personalized picks.

---

## 🚀 Live Deployments

| Platform | URL |
|---|---|
| ▲ **Vercel** | [cinematch-lime.vercel.app](https://cinematch-lime.vercel.app) |
| 🤗 **Hugging Face Spaces** | [huggingface.co/spaces/Vader26/cinematch](https://huggingface.co/spaces/Vader26/cinematch) |

---

## 🎯 Features

- **🤖 AI-Powered Recommendations** — Gemini AI analyzes your input and returns 6 curated movie picks tailored to your taste
- **🔍 Live Search Autocomplete** — TMDB-powered search suggestions as you type
- **🎭 Genre Filtering** — Filter recommendations by genre on the fly
- **🎬 Trailer Playback** — Watch YouTube trailers directly inside the app
- **📺 Streaming Providers** — See where each movie is available (Netflix, Prime, etc.)
- **🖼️ Movie Posters** — High-quality posters fetched from TMDB
- **⭐ Ratings & Reviews** — IMDb-style ratings + one-line critic reviews for every pick
- **🌙 Premium Dark UI** — Cinematic dark mode with animated gradient backgrounds
- **📱 Fully Responsive** — Works beautifully on desktop and mobile
- **⚡ Fallback Mode** — Falls back to curated mock data if API limits are hit

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Framer Motion |
| **Backend** | Node.js, Express 5 |
| **AI** | Google Gemini API (`gemini-flash-latest`) |
| **Movie Data** | TMDB API (posters, trailers, providers) |
| **Deployment** | Vercel (serverless) · Docker (HF Spaces) |
| **Styling** | Vanilla CSS with CSS custom properties |

---

## 📁 Project Structure

```
cinematch/
├── api/
│   ├── recommend.js       # Gemini AI + TMDB enrichment endpoint
│   └── autocomplete.js    # TMDB search suggestions endpoint
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx      # Autocomplete search input
│   │   ├── MovieCard.jsx      # Individual movie recommendation card
│   │   ├── GenreFilter.jsx    # Genre filter pills
│   │   ├── TrailerModal.jsx   # YouTube trailer overlay
│   │   ├── LoadingGrid.jsx    # Skeleton loading state
│   │   ├── GradientDots.jsx   # Animated background
│   │   ├── Header.jsx         # App header
│   │   └── Footer.jsx         # App footer
│   ├── data/
│   │   └── mockDb.js          # Fallback movie data
│   ├── App.jsx
│   └── App.css
├── server.js              # Express server (local dev + Docker)
├── Dockerfile             # Docker config for HF Spaces
└── vite.config.js
```

---

## 🧑‍💻 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/sankeerthts54-glitch/CineMatch.git
cd CineMatch
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

- Get a Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- Get a TMDB API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 4. Run the dev server

```bash
npm run dev
```

This starts both the Vite frontend and the Express proxy server concurrently.

---

## ☁️ Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `VITE_GEMINI_API_KEY`
   - `VITE_TMDB_API_KEY`
4. Deploy — Vercel auto-detects Vite and uses `/api` as serverless functions

### Hugging Face Spaces (Docker)

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space) with **Docker** SDK
2. Add your repo as a remote:
   ```bash
   git remote add space https://huggingface.co/spaces/YOUR_USERNAME/cinematch
   ```
3. Push: `git push space main`
4. In Space **Settings → Variables and secrets**, add:
   - `VITE_GEMINI_API_KEY`
   - `VITE_TMDB_API_KEY`

---

## 📸 How It Works

```
User types a movie title
        ↓
SearchBar sends query to /api/recommend
        ↓
Gemini AI returns 6 similar movies as JSON
        ↓
Each movie is enriched with TMDB data
(poster, trailer key, streaming providers)
        ↓
MovieCards rendered with full metadata
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/sankeerthts54-glitch">sankeerthts54</a>
</div>

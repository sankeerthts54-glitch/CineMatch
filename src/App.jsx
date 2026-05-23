// src/App.jsx
import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import GenreFilter from "./components/GenreFilter";
import MovieCard from "./components/MovieCard";
import Footer from "./components/Footer";
import LoadingGrid from "./components/LoadingGrid";
import { GradientDots } from "./components/GradientDots";
import TrailerModal from "./components/TrailerModal";

import { searchMovies, ALL_GENRES } from "./data/movies";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTrailerKey, setActiveTrailerKey] = useState(null);

  async function handleSearch(query) {
    setLoading(true);
    setError("");
    setMovies([]);
    setSearchQuery(query);
    setActiveGenre("All");
    setHasSearched(true);

    try {
      const results = await searchMovies(query);
      setMovies(results);
    } catch (err) {
      console.error(err);
      if (err.message.includes("401")) {
        setError("Invalid API key. Check your .env file and restart the dev server.");
      } else if (err.message.includes("429")) {
        setError("Rate limited. Please wait a moment and try again.");
      } else if (err.message && !err.message.includes("Failed to fetch")) {
        setError(err.message);
      } else {
        setError("Something went wrong fetching recommendations. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGenreChange(genre) {
    setActiveGenre(genre);
  }

  const moviesToShow =
    activeGenre === "All"
      ? movies
      : movies.filter((m) => m.genres?.includes(activeGenre));

  return (
    <div className="app">

      {/* Animated gradient dots background */}
      <GradientDots />

      {/* Dark overlay so text stays readable */}
      <div className="app__overlay" />

      <Header />

      <main className="main-content">
        <div className="container">

          <SearchBar onSearch={handleSearch} loading={loading} />

          {/* Genre filter — only visible after API returns results */}
          {hasSearched && !loading && movies.length > 0 && (
            <GenreFilter
              activeGenre={activeGenre}
              onGenreChange={handleGenreChange}
              genres={ALL_GENRES}
            />
          )}

          {/* LOADING */}
          {loading && <LoadingGrid query={searchQuery} />}

          {/* ERROR */}
          {!loading && error && (
            <div className="error-state">
              <div className="error-state__icon">⚠</div>
              <p className="error-state__message">{error}</p>
              <button
                className="error-state__retry"
                onClick={() => handleSearch(searchQuery)}
              >
                Try Again
              </button>
            </div>
          )}

          {/* RESULTS */}
          {!loading && !error && hasSearched && (
            <>
              {movies.length > 0 && (
                <div className="results-header">
                  <p className="results-header__query">
                    Because you watched <span>"{searchQuery}"</span>
                  </p>
                  <span className="results-header__count">
                    {moviesToShow.length} film{moviesToShow.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {moviesToShow.length > 0 ? (
                <div className="movie-grid">
                  {moviesToShow.map((movie, index) => (
                    <MovieCard key={movie.id ?? index} movie={movie} index={index} onPlayTrailer={setActiveTrailerKey} />
                  ))}
                </div>
              ) : movies.length > 0 ? (
                <div className="no-results">
                  No {activeGenre} films in these results. Try a different genre filter.
                </div>
              ) : null}
            </>
          )}

          {/* EMPTY STATE */}
          {!hasSearched && !loading && (
            <div className="empty-state">
              <span className="empty-state__icon">🎬</span>
              <p className="empty-state__text">
                Type any movie to get recommendations based on genres, directors and similar rating and reviews
              </p>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {activeTrailerKey && (
        <TrailerModal trailerKey={activeTrailerKey} onClose={() => setActiveTrailerKey(null)} />
      )}
    </div>
  );
}

export default App;

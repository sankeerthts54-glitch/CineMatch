// src/components/MovieCard.jsx
import { useState } from "react";

const GENRE_COLORS = {
  Action:    { bg: "rgba(220,50,50,0.12)",   color: "#ff7070", border: "rgba(220,50,50,0.25)"    },
  Thriller:  { bg: "rgba(160,100,240,0.12)", color: "#b98ef0", border: "rgba(160,100,240,0.25)"  },
  Drama:     { bg: "rgba(70,180,230,0.12)",  color: "#70c8f0", border: "rgba(70,180,230,0.25)"   },
  Comedy:    { bg: "rgba(240,190,60,0.12)",  color: "#f0c840", border: "rgba(240,190,60,0.25)"   },
  Horror:    { bg: "rgba(200,50,50,0.12)",   color: "#e06060", border: "rgba(200,50,50,0.25)"    },
  Romance:   { bg: "rgba(240,110,150,0.12)", color: "#f07090", border: "rgba(240,110,150,0.25)"  },
  "Sci-Fi":  { bg: "rgba(50,120,240,0.12)",  color: "#6090f0", border: "rgba(50,120,240,0.25)"   },
  Fantasy:   { bg: "rgba(120,50,200,0.12)",  color: "#a070e0", border: "rgba(120,50,200,0.25)"   },
  Animation: { bg: "rgba(0,200,150,0.12)",   color: "#00d4a0", border: "rgba(0,200,150,0.25)"    },
  Crime:     { bg: "rgba(220,110,70,0.12)",  color: "#e08060", border: "rgba(220,110,70,0.25)"   },
  Mystery:   { bg: "rgba(90,100,160,0.15)",  color: "#9098d0", border: "rgba(90,100,160,0.3)"    },
  Adventure: { bg: "rgba(240,150,80,0.12)",  color: "#f0a060", border: "rgba(240,150,80,0.25)"   },
  Biography: { bg: "rgba(120,180,20,0.12)",  color: "#90c030", border: "rgba(120,180,20,0.25)"   },
};

function buildImdbUrl(title, year) {
  const q = encodeURIComponent(`${title} ${year}`);
  return `https://www.imdb.com/find?q=${q}&s=tt&ttype=ft`;
}

function buildLetterboxdUrl(title) {
  const q = encodeURIComponent(title);
  return `https://letterboxd.com/search/${q}/`;
}

function StarRating({ rating }) {
  const fullStars = Math.floor(rating / 2);
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ color: i < fullStars ? "#f0a820" : "rgba(255,255,255,0.08)", fontSize: 13 }}>★</span>
      ))}
      <span className="star-rating__score">{Number(rating).toFixed(1)}</span>
    </div>
  );
}

function MovieCard({ movie, index, onPlayTrailer }) {
  const [showReview, setShowReview] = useState(false);

  const imdbUrl      = buildImdbUrl(movie.title, movie.year);
  const letterboxdUrl = buildLetterboxdUrl(movie.title);

  return (
    <article className="movie-card">
      {/* Dynamic Glow */}
      {movie.posterUrl && (
        <div 
          className="movie-card__glow" 
          style={{ backgroundImage: `url(${movie.posterUrl})` }} 
        />
      )}
      <div className="movie-card__layout">
        <div className="movie-card__left-col">
          {movie.posterUrl && (
            <div className="movie-card__poster">
              <img src={movie.posterUrl} alt={`${movie.title} poster`} loading="lazy" />
            </div>
          )}
          
          {movie.providers && movie.providers.length > 0 && (
            <div className="movie-providers">
              <span className="movie-providers__label">Stream On</span>
              <div className="movie-providers__logos">
                {movie.providers.map((p) => (
                  <img key={p.name} src={p.logo} alt={p.name} title={p.name} className="provider-logo" />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="movie-card__content">
          <div className="movie-card__top">
            <div style={{ flex: 1 }}>
              <div className="movie-card__index">#{String(index + 1).padStart(2, "0")}</div>
              <div className="movie-card__title">{movie.title}</div>
              <div className="movie-card__meta">
                <span>{movie.year}</span>
                <span className="movie-card__meta-dot">·</span>
                <span>{movie.runtime}</span>
                <span className="movie-card__meta-dot">·</span>
                <span>{movie.director}</span>
              </div>
            </div>
            <StarRating rating={movie.rating} />
          </div>

          <div className="genre-tags">
            {(movie.genres || []).map((genre) => {
              const s = GENRE_COLORS[genre] || {
                bg: "rgba(180,180,180,0.1)",
                color: "rgba(255,255,255,0.5)",
                border: "rgba(180,180,180,0.2)",
              };
              return (
                <span
                  key={genre}
                  className="genre-tag"
                  style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                >
                  {genre}
                </span>
              );
            })}
          </div>

          <div className="movie-card__divider" />

          <p className="movie-card__desc">{movie.description}</p>

          <div className="movie-card__review-toggle">
            <button className="review-btn" onClick={() => setShowReview(!showReview)}>
              {showReview ? "▲ Hide Review" : "▼ Critic's Take"}
            </button>
            {showReview && (
              <p className="movie-card__review">"{movie.review}"</p>
            )}
          </div>

          <div className="movie-card__reason">
            <span className="movie-card__reason-label">Why you'll love it </span>
            <span className="movie-card__reason-text">{movie.reason}</span>
          </div>
        </div>
      </div>

      {/* External links row */}
      <div className="movie-card__links">
        {movie.trailerKey && (
          <a
            href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="movie-link movie-link--trailer"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="movie-link__icon">▶</span>
            Trailer
          </a>
        )}
        <a
          href={imdbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="movie-link movie-link--imdb"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="movie-link__icon">⭐</span>
          IMDb
          <span className="movie-link__arrow">↗</span>
        </a>
        <a
          href={letterboxdUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="movie-link movie-link--letterboxd"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="movie-link__icon">🎞</span>
          Letterboxd
          <span className="movie-link__arrow">↗</span>
        </a>
      </div>
    </article>
  );
}

export default MovieCard;

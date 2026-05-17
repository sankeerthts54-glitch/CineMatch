// src/components/GenreFilter.jsx

function GenreFilter({ activeGenre, onGenreChange, genres }) {
  return (
    <section className="genre-filter">
      <p className="genre-filter__title">Filter by Genre</p>
      <div className="genre-filter__buttons">
        {genres.map((genre) => (
          <button
            key={genre}
            className={`genre-btn ${activeGenre === genre ? "active" : ""}`}
            onClick={() => onGenreChange(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </section>
  );
}

export default GenreFilter;

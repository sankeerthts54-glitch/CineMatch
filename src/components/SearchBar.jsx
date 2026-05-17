// src/components/SearchBar.jsx
import { useState, useEffect, useRef } from "react";

const SUGGESTIONS = [
  "Inception", "The Dark Knight", "Arrival", "RRR", "La La Land", "Joker",
];

function SearchBar({ onSearch, loading }) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError]           = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [isTyping, setIsTyping]     = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    if (!inputValue.trim() || inputValue.trim().length < 2 || !tmdbKey) {
      setAutocompleteResults([]);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(inputValue.trim())}&include_adult=false&page=1`);
        const data = await res.json();
        if (data.results) {
          setAutocompleteResults(data.results.slice(0, 5));
        }
      } catch (err) {
        console.error("Autocomplete fetch error", err);
      } finally {
        setIsTyping(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, tmdbKey]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError("Please enter a movie title.");
      return;
    }
    if (inputValue.trim().length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }
    setError("");
    setShowDropdown(false);
    onSearch(inputValue.trim());
  }

  function handleInputChange(e) {
    setInputValue(e.target.value);
    setShowDropdown(true);
    if (error) setError("");
  }

  function handleSuggestionClick(suggestion) {
    if (loading) return;
    setInputValue(suggestion);
    setError("");
    setShowDropdown(false);
    onSearch(suggestion);
  }

  return (
    <section className="search-section">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrapper" ref={dropdownRef}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder="Enter any movie title…"
            disabled={loading}
            aria-label="Search for a movie"
          />

          {showDropdown && autocompleteResults.length > 0 && !loading && (
            <ul className="autocomplete-dropdown">
              {autocompleteResults.map((m) => (
                <li key={m.id} onClick={() => handleSuggestionClick(m.title)}>
                  {m.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="" loading="lazy" />
                  ) : (
                    <div className="autocomplete-dropdown__no-poster">🎬</div>
                  )}
                  <div className="autocomplete-dropdown__info">
                    <span className="autocomplete-dropdown__title">{m.title}</span>
                    <span className="autocomplete-dropdown__year">{m.release_date?.split('-')[0]}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="search-btn"
          disabled={loading || !inputValue.trim()}
        >
          {loading
            ? <span className="search-btn__spinner" />
            : "Find Films"
          }
        </button>
      </form>

      {error && <p className="search-error">⚠ {error}</p>}

      <div className="suggestions">
        <span className="suggestions__label">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="suggestion-chip"
            disabled={loading}
            onClick={() => handleSuggestionClick(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}

export default SearchBar;

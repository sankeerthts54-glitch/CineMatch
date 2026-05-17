// src/components/LoadingGrid.jsx
// Shown while the Anthropic API is fetching.
// 6 skeleton cards that shimmer in the same 2-column layout.

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__top">
        <div className="skeleton-card__left">
          <div className="skeleton skeleton--index" />
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--meta" />
        </div>
        <div className="skeleton skeleton--rating" />
      </div>
      <div className="skeleton-card__tags">
        <div className="skeleton skeleton--tag" />
        <div className="skeleton skeleton--tag skeleton--tag-sm" />
      </div>
      <div className="skeleton skeleton--divider" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line skeleton--line-short" />
      <div className="skeleton skeleton--reason" />
    </div>
  );
}

function LoadingGrid({ query }) {
  return (
    <div className="loading-section">
      <div className="loading-header">
        <div className="loading-header__spinner" />
        <p className="loading-header__text">
          Finding films similar to <span>"{query}"</span>…
        </p>
      </div>
      <div className="movie-grid">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default LoadingGrid;

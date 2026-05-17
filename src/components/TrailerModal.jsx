// src/components/TrailerModal.jsx
export default function TrailerModal({ trailerKey, onClose }) {
  if (!trailerKey) return null;

  return (
    <div className="trailer-modal__overlay" onClick={onClose}>
      <button className="trailer-modal__close" onClick={onClose}>✕</button>
      <div className="trailer-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="trailer-modal__video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

// src/components/Header.jsx

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header__badge">✦ AI Movie Recommender</div>
        <h1 className="header__title">
          <span>CineMatch</span>
        </h1>
        <p className="header__subtitle">
          Type any movie and get 6 recommendations matched by genre, tone, and style.
        </p>
        <div className="header__line">
          <div className="header__line-dot" />
        </div>
      </div>
    </header>
  );
}

export default Header;

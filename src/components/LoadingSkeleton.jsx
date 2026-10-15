const LoadingSkeleton = () => (
  <article className="species-card species-card--loading" aria-label="Loading Pokémon entry">
    <div className="species-card__topline">
      <span className="skeleton-block skeleton-block--number" />
      <span className="skeleton-block skeleton-block--dot" />
    </div>
    <div className="species-card__artwork">
      <span className="skeleton-block skeleton-block--art" />
    </div>
    <div className="species-card__identity">
      <div className="species-card__loading-copy">
        <span className="skeleton-block skeleton-block--title" />
        <span className="skeleton-block skeleton-block--type" />
      </div>
      <span className="skeleton-block skeleton-block--action" />
    </div>
  </article>
);

export default LoadingSkeleton;

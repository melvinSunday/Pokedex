import { useState } from "react";
import PropTypes from "prop-types";
import { HiArrowUpRight, HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { getTypeVisual } from "./typeVisuals";

const NOOP = () => {};
const formatName = (name) => name.replace(/-/g, " ");

const PokemonCard = ({ pokemon, isFavorite = false, onToggleFavorite = NOOP, onSelectPokemon = NOOP }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const visual = getTypeVisual(pokemon.types?.[0]);
  const image = imageFailed ? pokemon.fallbackImage : pokemon.image;

  return (
    <article
      className="species-card species-card--interactive"
      style={{ "--species-accent": visual.accent, "--species-wash": visual.wash }}
      aria-labelledby={`species-name-${pokemon.id}`}
    >
      <div className="species-card__route-line" aria-hidden="true" />
      <button
        type="button"
        className="species-card__open-control"
        onClick={() => onSelectPokemon(pokemon)}
        aria-label={`Open field notes for ${formatName(pokemon.name)}`}
      />
      <div className="species-card__topline">
        <p className="species-card__number">
          <span aria-hidden="true">№</span> {String(pokemon.id).padStart(3, "0")}
        </p>
        <button
          type="button"
          className={`species-card__favorite${isFavorite ? " is-favorite" : ""}`}
          onClick={() => onToggleFavorite(pokemon)}
          aria-label={isFavorite ? `Remove ${formatName(pokemon.name)} from your field notes` : `Save ${formatName(pokemon.name)} to your field notes`}
          aria-pressed={isFavorite}
        >
          {isFavorite ? <HiHeart aria-hidden="true" /> : <HiOutlineHeart aria-hidden="true" />}
        </button>
      </div>

      <div className="species-card__artwork">
        <span className="species-card__orbit species-card__orbit--one" aria-hidden="true" />
        <span className="species-card__orbit species-card__orbit--two" aria-hidden="true" />
        <span className="species-card__route-pin" aria-hidden="true" />
        {image ? (
          <img
            src={image}
            alt={`${formatName(pokemon.name)} artwork`}
            className="species-card__image"
            width="192"
            height="192"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="species-card__artwork-empty" aria-hidden="true">?</div>
        )}
      </div>

      <div className="species-card__identity">
        <div>
          <h2 id={`species-name-${pokemon.id}`} className="species-card__name">{formatName(pokemon.name)}</h2>
          <div className="species-card__types" aria-label={`Type${pokemon.types?.length === 1 ? "" : "s"}`}>
            {(pokemon.types || []).map((type) => {
              const typeVisual = getTypeVisual(type);
              return (
                <span
                  key={type}
                  className="type-chip"
                  style={{ "--type-accent": typeVisual.accent, "--type-ink": typeVisual.ink }}
                >
                  <span className="type-chip__dot" aria-hidden="true" />
                  {type}
                </span>
              );
            })}
          </div>
        </div>
        <span className="species-card__open" aria-hidden="true">
          <span>Field notes</span>
          <HiArrowUpRight />
        </span>
      </div>
    </article>
  );
};

PokemonCard.propTypes = {
  pokemon: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    fallbackImage: PropTypes.string,
  }).isRequired,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
  onSelectPokemon: PropTypes.func,
};

export default PokemonCard;

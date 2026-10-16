import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HiHeart, HiOutlineChevronRight } from "react-icons/hi2";
import { PokemonContext } from "./Context/Context";
import Pokemons from "./Pokemons";
import PokemonDetailsDialog from "./PokemonDetailsDialog";
import SearchBar from "./SearchBar";
import { POKEMON_TYPES, getTypeVisual } from "./typeVisuals";

const API_URL = "https://pokeapi.co/api/v2/pokemon";
const FEATURED_POKEMON = { id: 25, name: "pikachu", url: `${API_URL}/25/` };
const FAVORITES_STORAGE_KEY = "pokedex-field-notes";

const getSavedPokemons = () => {
  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const favorites = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(favorites)) return [];
    return favorites
      .filter((pokemon) => Number.isInteger(Number(pokemon?.id)) && pokemon?.name)
      .map((pokemon) => {
        const id = Number(pokemon.id);
        return {
          id,
          name: pokemon.name,
          url: pokemon.url || `${API_URL}/${id}/`,
        };
      });
  } catch {
    return [];
  }
};

const MainPage = () => {
  const {
    summaries,
    detailsById,
    detailsLoading,
    movesById,
    movesLoading,
    loadPokemonSummary,
    loadPokemonDetails,
    loadPokemonMoves,
  } = useContext(PokemonContext);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(getSavedPokemons);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchTerm(query.trim()), 240);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // The field guide remains usable when browser storage is unavailable.
    }
  }, [favorites]);

  useEffect(() => {
    loadPokemonSummary(FEATURED_POKEMON).catch(() => {});
  }, [loadPokemonSummary]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("pokemon-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map(({ id }) => id)), [favorites]);

  const handleToggleFavorite = useCallback((pokemon) => {
    setFavorites((previous) => {
      if (previous.some((item) => item.id === pokemon.id)) {
        return previous.filter((item) => item.id !== pokemon.id);
      }
      return [...previous, {
        id: pokemon.id,
        name: pokemon.name,
        url: pokemon.url || `${API_URL}/${pokemon.id}/`,
      }].sort((left, right) => left.id - right.id);
    });
  }, []);

  const handleSelectPokemon = useCallback((pokemon) => {
    const entry = {
      id: pokemon.id,
      name: pokemon.name,
      url: pokemon.url || `${API_URL}/${pokemon.id}/`,
    };
    setSelectedPokemon(entry);
    loadPokemonDetails(entry);
  }, [loadPokemonDetails]);

  const featured = summaries[FEATURED_POKEMON.id];
  const electric = getTypeVisual("electric");
  const selectedSummary = selectedPokemon
    ? summaries[selectedPokemon.id] || selectedPokemon
    : null;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a href="#top" className="brand" aria-label="Pokédex field atlas home">
          <span className="brand__copy">
            <span className="brand__name"><span className="brand__name-poke">Poké</span><span className="brand__name-dex">dex</span></span>
            <span className="brand__descriptor">Field atlas</span>
          </span>
        </a>
        <div className="site-header__actions">
          
          <button
            type="button"
            className={`collection-button${showFavorites ? " is-active" : ""}`}
            onClick={() => setShowFavorites((active) => !active)}
            aria-pressed={showFavorites}
          >
            <HiHeart aria-hidden="true" />
            <span>Field notes</span>
            <span className="collection-button__count">{favorites.length}</span>
          </button>
        </div>
      </header>

      <main id="top" className="page-frame">
        <section className="welcome-panel" aria-labelledby="welcome-title">
          <div className="welcome-panel__copy">
            <h1 id="welcome-title">Find your next favorite.</h1>
            <p>Follow a type route, search by name or number, and get to know the Pokémon you meet along the way.</p>
            <SearchBar value={query} onChange={setQuery} />
            <p className="welcome-panel__hint">A field guide for curious trainers and careful collectors.</p>
          </div>

          <button
            type="button"
            className="featured-stop"
            onClick={() => handleSelectPokemon(FEATURED_POKEMON)}
            style={{ "--featured-accent": electric.accent, "--featured-wash": electric.wash }}
            aria-label={`Explore ${featured?.name || FEATURED_POKEMON.name}, National Pokédex number ${FEATURED_POKEMON.id}`}
          >
            <span className="featured-stop__map-mark" aria-hidden="true">
              <span className="featured-stop__map-ring" />
              <span className="featured-stop__map-point" />
            </span>
            {featured?.image ? (
              <img src={featured.image} alt="" className="featured-stop__image" width="232" height="232" />
            ) : <span className="featured-stop__image-placeholder" aria-hidden="true" />}
            <span className="featured-stop__footer">
              <span className="featured-stop__name">{featured?.name || "Pikachu"}</span>
              <span className="featured-stop__type">
                <span className="featured-stop__type-dot" aria-hidden="true" />
                <span>Electric type</span>
                <span className="featured-stop__number">№ 025</span>
              </span>
              <span className="featured-stop__arrow" aria-hidden="true"><HiOutlineChevronRight /></span>
            </span>
          </button>
          <span className="welcome-panel__contour welcome-panel__contour--one" aria-hidden="true" />
          <span className="welcome-panel__contour welcome-panel__contour--two" aria-hidden="true" />
        </section>

        <div className="atlas-layout">
          <aside className="route-sidebar" aria-label="Pokémon catalog filters">
            <div className="route-sidebar__heading">
              <h2>Type routes</h2>
              <span>18</span>
            </div>
            <p className="route-sidebar__description">Choose a path to explore.</p>
            <nav className="route-list" aria-label="Browse by Pokémon type">
              <button
                type="button"
                className={`route-link route-link--all${selectedType === null ? " is-selected" : ""}`}
                onClick={() => setSelectedType(null)}
                aria-pressed={selectedType === null}
              >
                <span className="route-link__marker" aria-hidden="true"><span /></span>
                <span>Every type</span>
              </button>
              {POKEMON_TYPES.map((type) => {
                const visual = getTypeVisual(type);
                return (
                  <button
                    key={type}
                    type="button"
                    className={`route-link${selectedType === type ? " is-selected" : ""}`}
                    onClick={() => setSelectedType(type)}
                    aria-pressed={selectedType === type}
                    style={{ "--route-accent": visual.accent, "--route-wash": visual.wash, "--route-ink": visual.ink }}
                  >
                    <span className="route-link__marker" aria-hidden="true"><span /></span>
                    <span>{type}</span>
                  </button>
                );
              })}
            </nav>
            <div className="route-sidebar__note">
              <span className="route-sidebar__note-pin" aria-hidden="true" />
              <p>Every great discovery starts with a little curiosity.</p>
            </div>
          </aside>

          <section className="catalog" aria-labelledby="catalog-title">
            <div className="catalog__heading">
              <div>
                <h2 id="catalog-title">
                  {showFavorites ? "Your field notes" : selectedType ? `${selectedType} route` : "Explore the atlas"}
                </h2>
                <p>
                  {showFavorites
                    ? "A personal collection of species worth remembering."
                    : selectedType
                      ? `Pokémon recorded along the ${selectedType} route.`
                      : "A world of remarkable Pokémon, ready to be discovered."}
                </p>
              </div>
            </div>

            <Pokemons
              searchTerm={searchTerm}
              selectedType={selectedType}
              showFavorites={showFavorites}
              favoritePokemons={favorites}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onSelectPokemon={handleSelectPokemon}
            />
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>Made for the long way round.</span>
        <span>Species data and artwork provided by <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a></span>
      </footer>

      <PokemonDetailsDialog
        pokemon={selectedSummary}
        details={selectedPokemon ? detailsById[selectedPokemon.id] : null}
        detailsLoading={Boolean(selectedPokemon && detailsLoading[selectedPokemon.id])}
        moves={selectedPokemon ? movesById[selectedPokemon.id] || [] : []}
        movesLoading={Boolean(selectedPokemon && movesLoading[selectedPokemon.id])}
        onRequestDetails={() => selectedPokemon && loadPokemonDetails(selectedPokemon)}
        onRequestMoves={() => selectedPokemon && loadPokemonMoves(selectedPokemon)}
        onClose={() => setSelectedPokemon(null)}
      />
    </div>
  );
};

export default MainPage;

import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { HiArrowPath, HiOutlineMagnifyingGlass, HiOutlineMap } from "react-icons/hi2";
import { PokemonContext } from "./Context/Context";
import PokemonCard from "./PokemonCard";
import LoadingSkeleton from "./LoadingSkeleton";

const EMPTY_ENTRIES = [];
const EMPTY_IDS = new Set();
const NOOP = () => {};
const normalizeName = (name = "") => name.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();

const Pokemons = ({
  searchTerm,
  selectedType = null,
  showFavorites = false,
  favoritePokemons = EMPTY_ENTRIES,
  favoriteIds = EMPTY_IDS,
  onToggleFavorite = NOOP,
  onSelectPokemon = NOOP,
}) => {
  const {
    pokemons,
    isLoading,
    loadMorePokemons,
    pokemonListError,
    retryPokemonList,
    searchPokemons,
    searchResults,
    isSearchLoading,
    searchError,
    hasMorePokemons,
    hasMoreSearchResults,
    loadMoreSearchResults,
    summaries,
    summaryLoading,
    summaryErrors,
    loadPokemonSummary,
    typePokemonsByName,
    typeLoadingByName,
    typeErrorsByName,
    loadTypePokemons,
  } = useContext(PokemonContext);
  const summaryObserver = useRef(null);
  const loadMoreRef = useRef(null);
  const pokemonRefs = useRef({});
  const entriesById = useRef(new Map());
  const summaryState = useRef({ summaries, summaryLoading, summaryErrors });
  const normalizedSearchTerm = normalizeName(searchTerm);
  const isSearching = normalizedSearchTerm.length > 0;
  const numericSearchId = /^\d+$/.test(normalizedSearchTerm) ? String(Number(normalizedSearchTerm)) : null;
  const isLocalMode = Boolean(selectedType || showFavorites);
  const isRemoteSearch = isSearching && !isLocalMode;
  const typeEntries = selectedType ? typePokemonsByName[selectedType] || EMPTY_ENTRIES : EMPTY_ENTRIES;

  summaryState.current = { summaries, summaryLoading, summaryErrors };

  useEffect(() => {
    if (isRemoteSearch) searchPokemons(normalizedSearchTerm);
    else searchPokemons("");
  }, [isRemoteSearch, normalizedSearchTerm, searchPokemons]);

  useEffect(() => {
    if (selectedType) loadTypePokemons(selectedType).catch(() => {});
  }, [loadTypePokemons, selectedType]);

  const displayedPokemons = useMemo(() => {
    let entries;
    if (selectedType) entries = typeEntries;
    else if (showFavorites) entries = favoritePokemons;
    else entries = isSearching ? searchResults : pokemons;

    if (!isLocalMode) return entries;
    return entries.filter((pokemon) => {
      if (showFavorites && !favoriteIds.has(pokemon.id)) return false;
      if (!isSearching) return true;
      return normalizeName(pokemon.name).includes(normalizedSearchTerm) || String(pokemon.id) === numericSearchId;
    });
  }, [
    favoriteIds,
    favoritePokemons,
    isLocalMode,
    isSearching,
    numericSearchId,
    normalizedSearchTerm,
    pokemons,
    searchResults,
    selectedType,
    showFavorites,
    typeEntries,
  ]);

  useEffect(() => {
    entriesById.current = new Map(displayedPokemons.map((pokemon) => [pokemon.id, pokemon]));
    if (typeof IntersectionObserver === "undefined") {
      displayedPokemons.forEach((pokemon) => loadPokemonSummary(pokemon).catch(() => {}));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const pokemon = entriesById.current.get(Number(entry.target.dataset.pokemonId));
        observer.unobserve(entry.target);
        const current = summaryState.current;
        if (pokemon && !current.summaries[pokemon.id] && !current.summaryLoading[pokemon.id] && !current.summaryErrors[pokemon.id]) {
          loadPokemonSummary(pokemon).catch(() => {});
        }
      });
    }, { rootMargin: "280px 0px", threshold: 0.01 });

    summaryObserver.current = observer;
    const current = summaryState.current;
    Object.entries(pokemonRefs.current).forEach(([id, element]) => {
      if (element && !current.summaries[id] && !current.summaryLoading[id] && !current.summaryErrors[id]) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [displayedPokemons, loadPokemonSummary]);

  const hasMoreEntries = isRemoteSearch ? hasMoreSearchResults : !isLocalMode && hasMorePokemons;
  const canLoadMore = hasMoreEntries && !isLocalMode;

  useEffect(() => {
    if (!loadMoreRef.current || !canLoadMore || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (isRemoteSearch && hasMoreSearchResults && !isSearchLoading) loadMoreSearchResults();
      else if (!isRemoteSearch && hasMorePokemons && !isLoading) loadMorePokemons();
    }, { rootMargin: "450px 0px", threshold: 0 });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [
    canLoadMore,
    displayedPokemons,
    hasMorePokemons,
    hasMoreSearchResults,
    isLoading,
    isRemoteSearch,
    isSearchLoading,
    loadMorePokemons,
    loadMoreSearchResults,
  ]);

  const setPokemonRef = useCallback((pokemonId, element) => {
    if (element) {
      element.dataset.pokemonId = String(pokemonId);
      pokemonRefs.current[pokemonId] = element;
      summaryObserver.current?.observe(element);
    } else {
      delete pokemonRefs.current[pokemonId];
    }
  }, []);

  const isTypeLoading = Boolean(selectedType && typeLoadingByName[selectedType]);
  const isTypeError = Boolean(selectedType && typeErrorsByName[selectedType]);
  const isBlockingLoad = (isRemoteSearch && isSearchLoading && displayedPokemons.length === 0)
    || (isTypeLoading && typeEntries.length === 0)
    || (!isLocalMode && !isSearching && isLoading && pokemons.length === 0);

  if (isBlockingLoad) {
    return (
      <div className="catalog-loading" aria-label="Loading Pokémon catalog">
        {Array.from({ length: 9 }, (_, index) => <LoadingSkeleton key={`skeleton-${index}`} />)}
      </div>
    );
  }

  if (isTypeError) {
    return (
      <div className="catalog-state" role="alert">
        <span className="catalog-state__icon"><HiOutlineMap aria-hidden="true" /></span>
        <h3>This route is hard to reach.</h3>
        <p>We couldn&apos;t load the {selectedType} Pokémon. Check your connection and try again.</p>
        <button type="button" className="state-action" onClick={() => loadTypePokemons(selectedType).catch(() => {})}>
          <HiArrowPath aria-hidden="true" /> Try this route again
        </button>
      </div>
    );
  }

  if (isRemoteSearch && searchError) {
    return (
      <div className="catalog-state" role="alert">
        <span className="catalog-state__icon"><HiOutlineMagnifyingGlass aria-hidden="true" /></span>
        <h3>That search got lost on the way.</h3>
        <p>We couldn&apos;t reach the catalog just now. Give it another try.</p>
        <button type="button" className="state-action" onClick={() => searchPokemons(normalizedSearchTerm)}>
          <HiArrowPath aria-hidden="true" /> Search again
        </button>
      </div>
    );
  }

  if (!isLocalMode && !isSearching && pokemonListError) {
    return (
      <div className="catalog-state" role="alert">
        <span className="catalog-state__icon"><HiOutlineMap aria-hidden="true" /></span>
        <h3>The atlas is taking a breather.</h3>
        <p>We couldn&apos;t load the catalog just now. Check your connection and give it another try.</p>
        <button type="button" className="state-action" onClick={retryPokemonList}>
          <HiArrowPath aria-hidden="true" /> Reload the atlas
        </button>
      </div>
    );
  }

  if (displayedPokemons.length === 0) {
    const title = showFavorites && favoritePokemons.length === 0
      ? "Your field notes are waiting."
      : "No Pokémon on this path yet.";
    const description = showFavorites && favoritePokemons.length === 0
      ? "Tap the heart on any species to keep it close for your next visit."
      : isSearching
        ? `We couldn't find a match for “${searchTerm}”. Try a name or Pokédex number.`
        : "Try another type route or head back to the full atlas.";

    return (
      <div className="catalog-state">
        <span className="catalog-state__icon"><HiOutlineMagnifyingGlass aria-hidden="true" /></span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    );
  }

  return (
    <>
      <div className="results-meta" aria-live="polite">
        <p><strong>{displayedPokemons.length}</strong> {displayedPokemons.length === 1 ? "entry" : "entries"}{canLoadMore ? " shown" : " in view"}</p>
        {isSearching && <span>Matching “{searchTerm}”</span>}
      </div>
      <div className="species-grid">
        {displayedPokemons.map((pokemon) => {
          const summary = summaries[pokemon.id];
          return (
            <div
              key={pokemon.id}
              ref={(element) => setPokemonRef(pokemon.id, element)}
              className="pokemon-card-slot"
            >
              {summary ? (
                <PokemonCard
                  pokemon={summary}
                  isFavorite={favoriteIds.has(pokemon.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectPokemon={onSelectPokemon}
                />
              ) : summaryErrors[pokemon.id] ? (
                <div className="species-error">
                  <span>We lost this field entry.</span>
                  <button type="button" onClick={() => loadPokemonSummary(pokemon).catch(() => {})}>Load it again</button>
                </div>
              ) : <LoadingSkeleton />}
            </div>
          );
        })}
        {canLoadMore && <div ref={loadMoreRef} className="load-more-sentinel" aria-hidden="true" />}
        {((isRemoteSearch && isSearchLoading) || (!isLocalMode && !isSearching && isLoading)) && (
          Array.from({ length: 3 }, (_, index) => <LoadingSkeleton key={`loading-${index}`} />)
        )}
      </div>
      {!isLocalMode && !isSearching && !hasMorePokemons && (
        <p className="catalog-endnote">You&apos;ve reached the end of this field guide.</p>
      )}
    </>
  );
};

Pokemons.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  selectedType: PropTypes.string,
  showFavorites: PropTypes.bool,
  favoritePokemons: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number, name: PropTypes.string, url: PropTypes.string })),
  favoriteIds: PropTypes.object,
  onToggleFavorite: PropTypes.func,
  onSelectPokemon: PropTypes.func,
};

export default Pokemons;

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useFetchPokemons } from "../FetchPokemons";

const API_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 15;

export const PokemonContext = createContext(null);

const getIdFromUrl = (url) => Number(url.split("/").filter(Boolean).at(-1));

const makePokemonEntry = ({ name, url }) => ({
  id: getIdFromUrl(url),
  name,
  url,
});

const Context = ({ children }) => {
  const {
    fetchPokemons,
    isLoading,
    hasMorePokemons,
    pokemonListError,
    pokemons,
    summaries,
    summaryLoading,
    summaryErrors,
    detailsById,
    detailsLoading,
    movesById,
    movesLoading,
    loadPokemonSummary,
    loadPokemonDetails,
    loadPokemonMoves,
  } = useFetchPokemons();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [hasMoreSearchResults, setHasMoreSearchResults] = useState(false);
  const [typePokemonsByName, setTypePokemonsByName] = useState({});
  const [typeLoadingByName, setTypeLoadingByName] = useState({});
  const [typeErrorsByName, setTypeErrorsByName] = useState({});

  const offsetRef = useRef(PAGE_SIZE);
  const loadMoreLock = useRef(false);
  const searchIndexRequest = useRef(null);
  const searchMatches = useRef([]);
  const searchOffset = useRef(0);
  const searchRequestId = useRef(0);
  const searchPageLock = useRef(false);
  const typeRequests = useRef(new Map());

  useEffect(() => {
    fetchPokemons(PAGE_SIZE, 0);
  }, [fetchPokemons]);

  const loadMorePokemons = useCallback(async () => {
    if (!hasMorePokemons || isLoading || loadMoreLock.current) return;

    loadMoreLock.current = true;
    const nextOffset = offsetRef.current;
    offsetRef.current += PAGE_SIZE;
    try {
      await fetchPokemons(PAGE_SIZE, nextOffset);
    } finally {
      loadMoreLock.current = false;
    }
  }, [fetchPokemons, hasMorePokemons, isLoading]);

  const retryPokemonList = useCallback(() => fetchPokemons(PAGE_SIZE, 0), [fetchPokemons]);

  const getSearchIndex = useCallback(() => {
    if (!searchIndexRequest.current) {
      searchIndexRequest.current = fetch(`${API_URL}/pokemon?limit=2000`).then((response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      }).catch((error) => {
        searchIndexRequest.current = null;
        throw error;
      });
    }
    return searchIndexRequest.current;
  }, []);

  const searchPokemons = useCallback(async (searchTerm) => {
    const requestId = ++searchRequestId.current;
    const term = searchTerm.trim().toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ");
    const numericTerm = /^\d+$/.test(term) ? String(Number(term)) : null;
    searchMatches.current = [];
    searchOffset.current = 0;
    setSearchResults([]);
    setHasMoreSearchResults(false);
    setSearchError(false);

    if (!term) {
      setIsSearchLoading(false);
      return [];
    }

    setIsSearchLoading(true);
    try {
      const data = await getSearchIndex();
      if (requestId !== searchRequestId.current) return [];

      const matches = data.results.filter((entry) => {
        const id = getIdFromUrl(entry.url).toString();
        const normalizedName = entry.name.toLowerCase().replace(/-/g, " ");
        return normalizedName.includes(term) || id === numericTerm;
      });
      searchMatches.current = matches;

      const firstPage = matches.slice(0, PAGE_SIZE).map(makePokemonEntry);
      searchOffset.current = firstPage.length;
      setSearchResults(firstPage);
      setHasMoreSearchResults(firstPage.length < matches.length);
      return firstPage;
    } catch (error) {
      if (requestId === searchRequestId.current) {
        console.error(`Failed to search Pokémon: ${error.message}`);
        setSearchResults([]);
        setSearchError(true);
      }
      return [];
    } finally {
      if (requestId === searchRequestId.current) setIsSearchLoading(false);
    }
  }, [getSearchIndex]);

  const loadMoreSearchResults = useCallback(() => {
    if (!hasMoreSearchResults || searchPageLock.current) return;
    searchPageLock.current = true;

    const nextPage = searchMatches.current
      .slice(searchOffset.current, searchOffset.current + PAGE_SIZE)
      .map(makePokemonEntry);
    searchOffset.current += nextPage.length;
    setSearchResults((previous) => [...previous, ...nextPage]);
    setHasMoreSearchResults(searchOffset.current < searchMatches.current.length);

    Promise.resolve().then(() => {
      searchPageLock.current = false;
    });
  }, [hasMoreSearchResults]);

  const loadTypePokemons = useCallback((typeName) => {
    let request = typeRequests.current.get(typeName);
    if (!request) {
      setTypeLoadingByName((previous) => ({ ...previous, [typeName]: true }));
      setTypeErrorsByName((previous) => ({ ...previous, [typeName]: false }));
      request = fetch(`${API_URL}/type/${typeName}`)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          return response.json();
        })
        .then((data) => data.pokemon
          .map(({ pokemon }) => makePokemonEntry(pokemon))
          .sort((left, right) => left.id - right.id))
        .then((entries) => {
          setTypePokemonsByName((previous) => ({ ...previous, [typeName]: entries }));
          return entries;
        })
        .catch((error) => {
          typeRequests.current.delete(typeName);
          setTypeErrorsByName((previous) => ({ ...previous, [typeName]: true }));
          console.error(`Failed to fetch ${typeName} Pokémon: ${error.message}`);
          throw error;
        })
        .finally(() => {
          setTypeLoadingByName((previous) => ({ ...previous, [typeName]: false }));
        });

      typeRequests.current.set(typeName, request);
    }

    return request;
  }, []);

  return (
    <PokemonContext.Provider
      value={{
        pokemons,
        isLoading,
        loadMorePokemons,
        hasMorePokemons,
        pokemonListError,
        retryPokemonList,
        summaries,
        summaryLoading,
        summaryErrors,
        detailsById,
        detailsLoading,
        movesById,
        movesLoading,
        loadPokemonSummary,
        loadPokemonDetails,
        loadPokemonMoves,
        searchPokemons,
        searchResults,
        isSearchLoading,
        searchError,
        hasMoreSearchResults,
        loadMoreSearchResults,
        typePokemonsByName,
        typeLoadingByName,
        typeErrorsByName,
        loadTypePokemons,
      }}
    >
      {children}
    </PokemonContext.Provider>
  );
};

Context.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Context;

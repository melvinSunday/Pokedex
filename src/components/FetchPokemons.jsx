import { useCallback, useRef, useState } from "react";

const API_URL = "https://pokeapi.co/api/v2";
const HOME_SPRITE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home";
const INITIAL_MOVE_COUNT = 15;

const getIdFromUrl = (url) => Number(url.split("/").filter(Boolean).at(-1));

const makePokemonEntry = ({ name, url }) => ({
  id: getIdFromUrl(url),
  name,
  url,
});

const capitalize = (value = "") =>
  value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const collectEvolutionRoutes = (node, previousStops = [], routes = []) => {
  const speciesId = getIdFromUrl(node.species.url);
  const evolutionDetails = node.evolution_details?.[0];
  const stop = {
    species_name: node.species.name,
    min_level: evolutionDetails?.min_level,
    trigger_name: evolutionDetails?.trigger?.name,
    item: evolutionDetails?.item?.name,
    image: `${HOME_SPRITE_URL}/${speciesId}.png`,
  };
  const route = [...previousStops, stop];

  if (node.evolves_to.length === 0) routes.push(route);
  else node.evolves_to.forEach((evolution) => collectEvolutionRoutes(evolution, route, routes));
  return routes;
};

export const useFetchPokemons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMorePokemons, setHasMorePokemons] = useState(true);
  const [pokemonListError, setPokemonListError] = useState(false);
  const [pokemons, setPokemons] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});
  const [summaryErrors, setSummaryErrors] = useState({});
  const [detailsById, setDetailsById] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  const [movesById, setMovesById] = useState({});
  const [movesLoading, setMovesLoading] = useState({});

  const pageRequests = useRef(new Map());
  const summaryRequests = useRef(new Map());
  const detailRequests = useRef(new Map());
  const moveRequests = useRef(new Map());
  const resourceRequests = useRef(new Map());

  const fetchJson = useCallback((url) => {
    let request = resourceRequests.current.get(url);
    if (!request) {
      request = fetch(url).then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed (${response.status}): ${url}`);
        }
        return response.json();
      });
      resourceRequests.current.set(url, request);
      request.catch(() => resourceRequests.current.delete(url));
    }
    return request;
  }, []);

  const fetchPokemons = useCallback((limit, currentOffset) => {
    const existingRequest = pageRequests.current.get(currentOffset);
    if (existingRequest) return existingRequest;

    if (currentOffset === 0) {
      setPokemonListError(false);
      setHasMorePokemons(true);
    }
    setIsLoading(true);
    const request = (async () => {
      const data = await fetchJson(
        `${API_URL}/pokemon?limit=${limit}&offset=${currentOffset}`
      );
      const entries = data.results.map(makePokemonEntry);

      setPokemons((previous) => {
        const existingIds = new Set(previous.map((pokemon) => pokemon.id));
        return [...previous, ...entries.filter((pokemon) => !existingIds.has(pokemon.id))];
      });
      if (currentOffset === 0) setPokemonListError(false);
      setHasMorePokemons(Boolean(data.next));
      return entries;
    })()
      .catch((error) => {
        console.error(`Failed to fetch Pokémon list: ${error.message}`);
        if (currentOffset === 0) setPokemonListError(true);
        setHasMorePokemons(false);
        return [];
      })
      .finally(() => {
        setIsLoading(false);
        pageRequests.current.delete(currentOffset);
      });

    pageRequests.current.set(currentOffset, request);
    return request;
  }, [fetchJson]);

  const loadPokemonSummary = useCallback((pokemon) => {
    if (!pokemon?.id || !pokemon.url) return Promise.resolve(null);

    let request = summaryRequests.current.get(pokemon.id);
    if (!request) {
      setSummaryLoading((previous) => ({ ...previous, [pokemon.id]: true }));
      setSummaryErrors((previous) => ({ ...previous, [pokemon.id]: false }));
      request = fetchJson(pokemon.url).then((data) => {
        const stats = Object.fromEntries(
          data.stats.map(({ stat, base_stat }) => [stat.name, base_stat])
        );
        const officialArtwork = data.sprites.other?.["official-artwork"]?.front_default;

        const summary = {
          id: data.id,
          name: data.name,
          types: data.types.map(({ type }) => type.name),
          image: data.sprites.other?.home?.front_default || officialArtwork || data.sprites.front_default,
          fallbackImage: officialArtwork || data.sprites.front_default,
          speciesUrl: data.species.url,
          locationAreaUrl: data.location_area_encounters,
          height: data.height,
          weight: data.weight,
          hp: stats.hp,
          attack: stats.attack,
          defense: stats.defense,
          specialAttack: stats["special-attack"],
          specialDefense: stats["special-defense"],
          speed: stats.speed,
          moveRefs: data.moves.slice(0, INITIAL_MOVE_COUNT).map(({ move, version_group_details }) => ({
            name: move.name,
            url: move.url,
            level_learned_at: version_group_details[0]?.level_learned_at,
            learn_method: version_group_details[0]?.move_learn_method.name,
          })),
        };

        setSummaries((previous) => ({ ...previous, [pokemon.id]: summary }));
        return summary;
      }).catch((error) => {
        console.warn(`Failed to load ${pokemon.name}: ${error.message}`);
        setSummaryErrors((previous) => ({ ...previous, [pokemon.id]: true }));
        summaryRequests.current.delete(pokemon.id);
        return null;
      });

      summaryRequests.current.set(pokemon.id, request);
      request.then(() => {
        setSummaryLoading((previous) => ({ ...previous, [pokemon.id]: false }));
      }, () => {
        setSummaryLoading((previous) => ({ ...previous, [pokemon.id]: false }));
      });
    }

    return request;
  }, [fetchJson]);

  const loadPokemonDetails = useCallback((pokemon) => {
    if (!pokemon?.id) return Promise.resolve(null);

    let request = detailRequests.current.get(pokemon.id);
    if (!request) {
      setDetailsLoading((previous) => ({ ...previous, [pokemon.id]: true }));
      request = (async () => {
        const summary = summaries[pokemon.id] || await loadPokemonSummary(pokemon);
        if (!summary) return null;

        const [speciesData, locationAreasData] = await Promise.all([
          fetchJson(summary.speciesUrl),
          fetchJson(summary.locationAreaUrl),
        ]);
        const evolutionData = speciesData.evolution_chain?.url
          ? await fetchJson(speciesData.evolution_chain.url)
          : null;
        const flavorText = speciesData.flavor_text_entries?.find(
          (entry) => entry.language.name === "en"
        )?.flavor_text;
        const details = {
          description: flavorText?.replace(/[\f\n]/g, " ") || "No description available.",
          habitat: speciesData.habitat ? capitalize(speciesData.habitat.name) : "Unknown",
          shape: capitalize(speciesData.shape?.name || "Unknown"),
          eggGroups: speciesData.egg_groups.map(({ name }) => capitalize(name)).join(", ") || "Unknown",
          captureRate: speciesData.capture_rate ?? 0,
          location: locationAreasData
            .map(({ location_area: area }) => capitalize(area.name))
            .join(", "),
          varieties: speciesData.varieties.map(({ pokemon: variety }) => variety.name).join(", "),
          japaneseName: speciesData.names.find((entry) => entry.language.name === "ja")?.name || "Unknown",
          japaneseRomaji: speciesData.names.find((entry) => entry.language.name === "roomaji")?.name || "Unknown",
          isMythical: speciesData.is_mythical,
          isLegendary: speciesData.is_legendary,
          isBaby: speciesData.is_baby,
          evolutionRoutes: evolutionData ? collectEvolutionRoutes(evolutionData.chain) : [],
        };

        setDetailsById((previous) => ({ ...previous, [pokemon.id]: details }));
        return details;
      })().catch((error) => {
        console.warn(`Failed to load details for ${pokemon.name}: ${error.message}`);
        detailRequests.current.delete(pokemon.id);
        return null;
      });

      detailRequests.current.set(pokemon.id, request);
      request.then(() => {
        setDetailsLoading((previous) => ({ ...previous, [pokemon.id]: false }));
      }, () => {
        setDetailsLoading((previous) => ({ ...previous, [pokemon.id]: false }));
      });
    }

    return request;
  }, [fetchJson, loadPokemonSummary, summaries]);

  const loadPokemonMoves = useCallback((pokemon) => {
    if (!pokemon?.id) return Promise.resolve([]);

    let request = moveRequests.current.get(pokemon.id);
    if (!request) {
      setMovesLoading((previous) => ({ ...previous, [pokemon.id]: true }));
      request = (async () => {
        const summary = summaries[pokemon.id] || await loadPokemonSummary(pokemon);
        if (!summary) return [];

        const moves = await Promise.all(
          summary.moveRefs.slice(0, INITIAL_MOVE_COUNT).map(async (move) => {
            try {
              const moveData = await fetchJson(move.url);
              return {
                ...move,
                name: capitalize(move.name),
                target: moveData.target.name,
                power: moveData.power,
                pp: moveData.pp,
                accuracy: moveData.accuracy,
              };
            } catch {
              return null;
            }
          })
        );
        const availableMoves = moves.filter(Boolean);
        setMovesById((previous) => ({ ...previous, [pokemon.id]: availableMoves }));
        return availableMoves;
      })().catch((error) => {
        console.warn(`Failed to load moves for ${pokemon.name}: ${error.message}`);
        moveRequests.current.delete(pokemon.id);
        return [];
      });

      moveRequests.current.set(pokemon.id, request);
      request.then(() => {
        setMovesLoading((previous) => ({ ...previous, [pokemon.id]: false }));
      }, () => {
        setMovesLoading((previous) => ({ ...previous, [pokemon.id]: false }));
      });
    }

    return request;
  }, [fetchJson, loadPokemonSummary, summaries]);

  return {
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
  };
};

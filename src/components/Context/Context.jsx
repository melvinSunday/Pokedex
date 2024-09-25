import { createContext, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useFetchPokemons } from "../FetchPokemons";

export const PokemonContext = createContext(null);

const Context = ({ children }) => {
  const { fetchPokemons, isLoading, hasMorePokemons, pokemons, setIsLoading } =
    useFetchPokemons();
  const [offset, setOffset] = useState(0);
  const initialLoad = 5;
  const batchSize = 5;

  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchPokemons(initialLoad, 0);
  }, [fetchPokemons]);

  const loadMorePokemons = useCallback(() => {
    if (hasMorePokemons && !isLoading) {
      const newOffset = offset + batchSize;
      setOffset(newOffset);
      fetchPokemons(batchSize, newOffset);
    }
  }, [offset, fetchPokemons, hasMorePokemons, isLoading, batchSize]);

  const searchPokemons = useCallback(async (searchTerm) => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // fetch all Pokémon names and URLs
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // filter Pokémon based on search term
      const filteredPokemons = data.results.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pokemon.url.split('/').slice(-2, -1)[0] === searchTerm
      );

      // fetch details for filtered Pokémon in parallel
      const pokemonDetails = await Promise.all(
        filteredPokemons.map(async (pokemon) => {
          return await fetchPokemonDetails(pokemon.url);
        })
      );

      setSearchResults(pokemonDetails.filter(pokemon => pokemon !== null));
      setIsLoading(false);
    } catch (error) {
      console.error(`Failed to search pokemons: ${error}`);
      setSearchResults([]);
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const fetchPokemonDetails = async (url) => {
    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(url),
        fetch(url.replace("pokemon", "pokemon-species")),
      ]);

      if (!pokemonRes.ok || !speciesRes.ok) {
        console.warn(`Failed to fetch details for ${url}`);
        return null;
      }

      const [pokemonData, speciesData] = await Promise.all([
        pokemonRes.json(),
        speciesRes.json(),
      ]);

      const pogoImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonData.id}.png`;
      const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`;

      const locationAreasRes = await fetch(pokemonData.location_area_encounters);
      if (!locationAreasRes.ok) {
        console.warn(`Failed to fetch location areas for ${url}`);
        return null;
      }
      const locationAreasData = await locationAreasRes.json();

      const locations = locationAreasData
        .map((area) =>
          area.location_area.name
            .replace(/-/g, " ")
            .replace(/\w\S*/g, (w) =>
              w.replace(/^\w/, (c) => c.toUpperCase())
            )
        )
        .join(", ");

      const varieties = speciesData.varieties
        .map((variety) => variety.pokemon.name)
        .join(", ");

      const japaneseName =
        speciesData.names.find((name) => name.language.name === "ja")
          ?.name || "Unknown";

      const japaneseRomaji =
        speciesData.names.find(
          (name) => name.language.name === "roomaji"
        )?.name || "Unknown";

      const stats = pokemonData.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {});

      const evolutionChainRes = await fetch(
        speciesData.evolution_chain.url
      );

      if (!evolutionChainRes.ok) {
        console.warn(
          `Failed to fetch evolution chain for ${url}`
        );
        return null;
      }

      const evolutionChainData = await evolutionChainRes.json();

      const getEvolutionDetails = async (evolutionData) => {
        const evolutions = [];
        let evoData = evolutionData.chain;

        do {
          const evolutionDetails = evoData.evolution_details[0];
          const speciesRes = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${evoData.species.name}`
          );

          if (!speciesRes.ok) {
            console.warn(`Failed to fetch ${evoData.species.name}`);
            return evolutions;
          }

          const speciesData = await speciesRes.json();
          const evolutionImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${speciesData.id}.png`;

          evolutions.push({
            species_name: evoData.species.name,
            min_level: evolutionDetails?.min_level,
            trigger_name: evolutionDetails?.trigger?.name,
            item: evolutionDetails?.item?.name,
            image: evolutionImage,
          });

          evoData = evoData["evolves_to"][0];
        } while (
          evoData &&
          Object.prototype.hasOwnProperty.call(evoData, "evolves_to")
        );

        return evolutions;
      };

      const evolutions = await getEvolutionDetails(
        evolutionChainData
      );

      const moves = await Promise.all(pokemonData.moves.map(async (move) => {
        const moveRes = await fetch(move.move.url);
        if (!moveRes.ok) {
          console.warn(`Failed to fetch move details for ${move.move.name}`);
          return null;
        }
        const moveData = await moveRes.json();
        return {
          name: move.move.name
            .replace(/-/g, " ")
            .replace(/\w\S*/g, (w) =>
              w.replace(/^\w/, (c) => c.toUpperCase())
            ),
          level_learned_at:
            move.version_group_details[0].level_learned_at,
          learn_method:
            move.version_group_details[0].move_learn_method.name,
          target: moveData.target.name,
          power: moveData.power,
          pp: moveData.pp,
          accuracy: moveData.accuracy,
        };
      }));

      return {
        ...pokemonData,
        image: pogoImage,
        fallbackImage: officialArtwork,
        description: speciesData.flavor_text_entries
          .find((entry) => entry.language.name === "en")
          .flavor_text.replace(/\f/g, " "),
        habitat: speciesData.habitat
          ? speciesData.habitat.name.charAt(0).toUpperCase() +
            speciesData.habitat.name.slice(1)
          : "Unknown",
        shape:
          speciesData.shape.name.charAt(0).toUpperCase() +
          speciesData.shape.name.slice(1),
        eggGroups: speciesData.egg_groups
          .map(
            (group) =>
              group.name.charAt(0).toUpperCase() + group.name.slice(1)
          )
          .join(", "),
        captureRate: speciesData.capture_rate,
        location: locations,
        varieties: varieties,
        japaneseName: japaneseName,
        japaneseRomaji: japaneseRomaji,
        hp: stats.hp,
        attack: stats.attack,
        defense: stats.defense,
        specialAttack: stats["special-attack"],
        specialDefense: stats["special-defense"],
        speed: stats.speed,
        evolutions: evolutions,
        evolutionChain: evolutionChainData,
        moves: moves,
        isMythical: speciesData.is_mythical,
        isLegendary: speciesData.is_legendary,
        isBaby: speciesData.is_baby,
      };
    } catch (error) {
      console.warn(`Failed to fetch details for ${url}: ${error.message}`);
      return null;
    }
  };

  return (
    <PokemonContext.Provider value={{ pokemons, isLoading, loadMorePokemons, searchPokemons, searchResults, hasMorePokemons }}>
      {children}
    </PokemonContext.Provider>
  );
};

Context.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Context;
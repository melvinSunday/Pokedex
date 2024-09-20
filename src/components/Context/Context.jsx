import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const PokemonContext = createContext(null);

const Context = ({ children }) => {
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPokemons = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
         "https://pokeapi.co/api/v2/pokemon?limit=385",
          { signal }
        );
        const data = await response.json();

        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon) => {
            const [pokemonRes, speciesRes] = await Promise.all([
              fetch(pokemon.url, { signal }),
              fetch(pokemon.url.replace('pokemon', 'pokemon-species'), { signal })
            ]);
            const [pokemonData, speciesData] = await Promise.all([
              pokemonRes.json(),
              speciesRes.json()
            ]);

            const pogoImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonData.id}.png`;
            const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`;

            // Fetch location areas
            const locationAreasRes = await fetch(pokemonData.location_area_encounters, { signal });
            const locationAreasData = await locationAreasRes.json();
            const locations = locationAreasData.map(area => area.location_area.name.replace(/-/g, ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))).join(', ');

            // Fetch varieties
            const varieties = speciesData.varieties.map(variety => variety.pokemon.name).join(', ');

            // Fetch Japanese name and romaji
            const japaneseName = speciesData.names.find(name => name.language.name === "ja")?.name || "Unknown";
            const japaneseRomaji = speciesData.names.find(name => name.language.name === "roomaji")?.name || "Unknown";

            // Fetch stats
            const stats = pokemonData.stats.reduce((acc, stat) => {
              acc[stat.stat.name] = stat.base_stat;
              return acc;
            }, {});

            // Fetch evolution chain
            const evolutionChainRes = await fetch(speciesData.evolution_chain.url, { signal });
            const evolutionChainData = await evolutionChainRes.json();

            const getEvolutionDetails = async (evolutionData) => {
              const evolutions = [];
              let evoData = evolutionData.chain;

              do {
                const evolutionDetails = evoData.evolution_details[0];
                const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoData.species.name}`, { signal });
                const speciesData = await speciesRes.json();
                const evolutionImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${speciesData.id}.png`;

                evolutions.push({
                  species_name: evoData.species.name,
                  min_level: evolutionDetails?.min_level,
                  trigger_name: evolutionDetails?.trigger?.name,
                  item: evolutionDetails?.item?.name,
                  image: evolutionImage
                });

                evoData = evoData['evolves_to'][0];
              } while (evoData && Object.prototype.hasOwnProperty.call(evoData, 'evolves_to'));

              return evolutions;
            };

            const evolutions = await getEvolutionDetails(evolutionChainData);

            // Fetch moves
            const moves = pokemonData.moves.map(move => ({
              name: move.move.name.replace(/-/g, ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase()))),
              level_learned_at: move.version_group_details[0].level_learned_at,
              learn_method: move.version_group_details[0].move_learn_method.name
            }));

            return {
              ...pokemonData,
              image: pogoImage,
              fallbackImage: officialArtwork,
              description: speciesData.flavor_text_entries.find(
                (entry) => entry.language.name === "en"
              ).flavor_text.replace(/\f/g, ' '),
              habitat: speciesData.habitat
                ? speciesData.habitat.name.charAt(0).toUpperCase() + speciesData.habitat.name.slice(1)
                : "Unknown",
              shape: speciesData.shape.name.charAt(0).toUpperCase() + speciesData.shape.name.slice(1),
              eggGroups: speciesData.egg_groups
                .map((group) => group.name.charAt(0).toUpperCase() + group.name.slice(1))
                .join(", "),
                
              //About
              captureRate: speciesData.capture_rate,
              location: locations,
              varieties: varieties,
              japaneseName: japaneseName,
              japaneseRomaji: japaneseRomaji,
             
              //Base Stats
              hp: stats.hp,
              attack: stats.attack,
              defense: stats.defense,
              specialAttack: stats['special-attack'],
              specialDefense: stats['special-defense'],
              speed: stats.speed,

              //Evolution
              evolutions: evolutions,
              evolutionChain: evolutionChainData,

              //Moves
              moves: moves,

              // Mythical or Legendary status
              isMythical: speciesData.is_mythical,
              isLegendary: speciesData.is_legendary,
            };
          })
        );

        if (!signal.aborted) {
          setPokemons(pokemonDetails);
          setIsLoading(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(`Failed to fetch pokemons: ${error}`);
          setIsLoading(false);
        }
      }
    };

    fetchPokemons();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <PokemonContext.Provider value={{ pokemons, isLoading }}>
      {children}
    </PokemonContext.Provider>
  );
};

Context.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Context;

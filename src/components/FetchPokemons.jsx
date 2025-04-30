
import { useCallback, useState } from "react";

export const useFetchPokemons = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [hasMorePokemons, setHasMorePokemons] = useState(true);
    const [pokemons, setPokemons] = useState([]);

    // useCallback hook to memoize the fetchPokemons function
    const fetchPokemons = useCallback(async (limit, currentOffset) => {
        // set loading to true when fetching starts
        setIsLoading(true);
        try {
            // fetch list of pokemons with given limit and offset
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`
            );

            if (!response.ok) {
                throw new Error(`http error! status: ${response.status}`);
            }
            const data = await response.json();

            // if no results, set hasMorePokemons to false and exit
            if (data.results.length === 0) {
                setHasMorePokemons(false);
                setIsLoading(false);
                return;
            }

            // cache for shared resources to avoid redundant requests
            const evolutionChainCache = new Map();
            const moveCache = new Map();

            // process all pokémon in parallel to improve performance
            const pokemonDetails = await Promise.all(
                data.results.map(async (pokemon) => {
                    try {
                        // fetch pokemon details and species data in parallel
                        const [pokemonRes, speciesRes] = await Promise.all([
                            fetch(pokemon.url),
                            fetch(pokemon.url.replace("pokemon", "pokemon-species")),
                        ]);

        
                        if (!pokemonRes.ok || !speciesRes.ok) {
                            console.warn(`failed to fetch details for ${pokemon.name}`);
                            return null;
                        }


                        const [pokemonData, speciesData] = await Promise.all([
                            pokemonRes.json(),
                            speciesRes.json(),
                        ]);

                        // parallelize fetching location areas and evolution chain data
                        const [locationAreasRes, evolutionChainRes] = await Promise.all([
                            fetch(pokemonData.location_area_encounters),
                            // use cached evolution chain if available, otherwise fetch and cache it
                            evolutionChainCache.has(speciesData.evolution_chain.url)
                                ? Promise.resolve()
                                : fetch(speciesData.evolution_chain.url).then(res => res.json())
                        ]);

                        // cache the evolution chain data
                        if (!evolutionChainCache.has(speciesData.evolution_chain.url)) {
                            evolutionChainCache.set(
                                speciesData.evolution_chain.url,
                                evolutionChainRes
                            );
                        }

                        // process location areas data if fetch is successful, otherwise default to empty array
                        const locationAreasData = locationAreasRes.ok
                            ? await locationAreasRes.json()
                            : [];

                        // lazy loading for moves: fetches initial set of moves and provides function to fetch more
                        const initialMoveCount = 15;
                        const fetchMoves = async (offset = 0, limit = initialMoveCount) => {
                            // get subset of moves to fetch based on offset and limit
                            const movesToFetch = pokemonData.moves.slice(offset, offset + limit);
                            return Promise.all(
                                movesToFetch.map(async (move) => {
                                    // use cached move data if available, otherwise fetch and cache
                                    if (moveCache.has(move.move.url)) {
                                        return moveCache.get(move.move.url);
                                    }
                                    const moveRes = await fetch(move.move.url);
                                    if (!moveRes.ok) return null; // return null if move fetch fails
                                    const moveData = await moveRes.json();
                                    // format move data to be more readable and useful
                                    const formattedMove = {
                                        name: move.move.name
                                            .replace(/-/g, " ")
                                            .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())), // format move name
                                        level_learned_at: move.version_group_details[0].level_learned_at,
                                        learn_method: move.version_group_details[0].move_learn_method.name,
                                        target: moveData.target.name,
                                        power: moveData.power,
                                        pp: moveData.pp,
                                        accuracy: moveData.accuracy,
                                    };
                                    moveCache.set(move.move.url, formattedMove); // cache formatted move
                                    return formattedMove;
                                })
                            );
                        };

                        // fetch initial set of moves for the pokemon
                        const initialMoves = await fetchMoves();

                        // function to process evolution details from the evolution chain data
                        const getEvolutionDetails = async (evolutionData) => {
                            const evolutions = [];
                            let evoData = evolutionData.chain;

                            // traverse the evolution chain to extract evolution details
                            do {
                                const evolutionDetails = evoData.evolution_details[0];
                                // fetch species data for each evolution stage
                                const speciesRes = await fetch(
                                    `https://pokeapi.co/api/v2/pokemon/${evoData.species.name}`
                                );

                                // log warning and return current evolutions if fetching species fails
                                if (!speciesRes.ok) {
                                    console.warn(`failed to fetch ${evoData.species.name}`);
                                    return evolutions;
                                }

                                const speciesData = await speciesRes.json();
                                // construct image url for evolution stage
                                const evolutionImage = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/home/${speciesData.id}.png`;

                                // push evolution details to the evolutions array
                                evolutions.push({
                                    species_name: evoData.species.name,
                                    min_level: evolutionDetails?.min_level,
                                    trigger_name: evolutionDetails?.trigger?.name,
                                    item: evolutionDetails?.item?.name,
                                    image: evolutionImage,
                                });

                                // move to the next evolution stage if available
                                evoData = evoData.evolves_to[0];
                            } while (evoData && evoData.evolves_to); // continue until no more evolutions

                            return evolutions;
                        };


                        return {
                            ...pokemonData,

                            image: `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/home/${pokemonData.id}.png`,
                            fallbackImage: `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`,
                       
                            description: speciesData.flavor_text_entries
                                .find((entry) => entry.language.name === "en")
                                ?.flavor_text.replace(/\f/g, " ") || "no description available",
                            // format habitat name
                            habitat: speciesData.habitat
                                ? speciesData.habitat.name.charAt(0).toUpperCase() +
                                    speciesData.habitat.name.slice(1)
                                : "unknown",
                            // format shape name
                            shape:
                                speciesData.shape.name.charAt(0).toUpperCase() +
                                speciesData.shape.name.slice(1),
                            // format egg groups and join them into a string
                            eggGroups: speciesData.egg_groups
                                .map(
                                    (group) =>
                                        group.name.charAt(0).toUpperCase() + group.name.slice(1)
                                )
                                .join(", "),
                            captureRate: speciesData.capture_rate,
                            // format and join location area names
                            location: locationAreasData
                                .map((area) =>
                                    area.location_area.name
                                        .replace(/-/g, " ")
                                        .replace(/\w\S*/g, (w) =>
                                            w.replace(/^\w/, (c) => c.toUpperCase())
                                        )
                                )
                                .join(", "),
                            // join varieties names
                            varieties: speciesData.varieties
                                .map((variety) => variety.pokemon.name)
                                .join(", "),
                            // extract japanese name or default to "unknown"
                            japaneseName:
                                speciesData.names.find((name) => name.language.name === "ja")
                                    ?.name || "unknown",
                            // extract japanese romaji name or default to "unknown"
                            japaneseRomaji:
                                speciesData.names.find(
                                    (name) => name.language.name === "roomaji"
                                )?.name || "unknown",
                            // extract base stats and structure them into hp, attack, defense, etc.
                            hp: pokemonData.stats.reduce((acc, stat) => {
                                acc[stat.stat.name] = stat.base_stat;
                                return acc;
                            }, {})["hp"],
                            attack: pokemonData.stats.reduce((acc, stat) => {
                                acc[stat.stat.name] = stat.base_stat;
                                return acc;
                            }, {})["attack"],
                            defense: pokemonData.stats.reduce((acc, stat) => {
                                acc[stat.stat.name] = stat.base_stat;
                                return acc;
                            }, {})["defense"],
                            specialAttack: pokemonData.stats.reduce((acc, stat) => {
                                acc[stat.stat.name] = stat.base_stat;
                                return acc;
                            }, {})["special-attack"],
                            specialDefense: pokemonData.stats.reduce((acc, stat) => {
                                acc[stat.stat.name] = stat.base_stat;
                                return acc;
                            }, {})["special-defense"],
                            speed: pokemonData.stats.reduce((acc, stat) => {
                                acc[stat.stat.name] = stat.base_stat;
                                return acc;
                            }, {})["speed"],
                            // process evolution details using cached evolution chain data
                            evolutions: await getEvolutionDetails(evolutionChainCache.get(speciesData.evolution_chain.url)),
                            evolutionChain: evolutionChainCache.get(speciesData.evolution_chain.url),
                            moves: initialMoves, // initial set of moves
                            fetchMoreMoves: fetchMoves, // function to fetch more moves
                            totalMoves: pokemonData.moves.length, // total number of moves
                            isMythical: speciesData.is_mythical,
                            isLegendary: speciesData.is_legendary,
                            isBaby: speciesData.is_baby,
                        };
                    } catch (error) {
                        // log warning if fetching details fails for a specific pokemon
                        console.warn(`failed to fetch details for ${pokemon.name}: ${error.message}`);
                        return null; // return null to filter out failed pokemon fetches
                    }
                })
            );


            setPokemons((prev) => [...prev, ...pokemonDetails.filter(p => p !== null)]);
        } catch (error) {

            console.error(`failed to fetch pokemons: ${error}`);
            setHasMorePokemons(false); // indicate no more pokemons can be fetched due to error
        } finally {

            setIsLoading(false);
        }
    }, []);


    return { fetchPokemons, isLoading, setIsLoading, hasMorePokemons, pokemons };
};

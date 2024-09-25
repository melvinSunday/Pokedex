import { useCallback, useState } from "react";

export const useFetchPokemons = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasMorePokemons, setHasMorePokemons] = useState(true);
    const [pokemons, setPokemons] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 13; 

    const fetchPokemons = useCallback(async () => {
        if (!hasMorePokemons || isLoading) return; 
        setIsLoading(true);

        try {
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();


            if (data.results.length === 0) {
                setHasMorePokemons(false);
                setIsLoading(false);
                return;
            }

            const pokemonDetails = [];
            for (const pokemon of data.results) {
                try {
                    const [pokemonRes, speciesRes] = await Promise.all([
                        fetch(pokemon.url),
                        fetch(pokemon.url.replace("pokemon", "pokemon-species")),
                    ]);

                    if (!pokemonRes.ok || !speciesRes.ok) {
                        console.warn(`Failed to fetch details for ${pokemon.name}`);
                        continue;
                    }

                    const [pokemonData, speciesData] = await Promise.all([
                        pokemonRes.json(),
                        speciesRes.json(),
                    ]);

                    const pogoImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonData.id}.png`;
                    const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`;

                    const locationAreasRes = await fetch(pokemonData.location_area_encounters);
                    if (!locationAreasRes.ok) {
                        console.warn(`Failed to fetch location areas for ${pokemon.name}`);
                        continue;
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
                            `Failed to fetch evolution chain for ${pokemon.name}`
                        );
                        continue;
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

                    const fetchMoves = async (offset = 0, limit = pokemonData.moves.length) => {
                        const movesToFetch = pokemonData.moves.slice(offset, offset + limit);
                        const fetchedMoves = await Promise.all(movesToFetch.map(async (move) => {
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
                        return fetchedMoves.filter(move => move !== null);
                    };

                    const initialMoves = await fetchMoves();

                    pokemonDetails.push({
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
                        moves: initialMoves,
                        fetchMoreMoves: fetchMoves,
                        totalMoves: pokemonData.moves.length,
                        isMythical: speciesData.is_mythical,
                        isLegendary: speciesData.is_legendary,
                        isBaby: speciesData.is_baby,
                    });
                } catch (error) {
                    console.warn(
                        `Failed to fetch details for ${pokemon.name}: ${error.message}`
                    );
                }
            }

            setPokemons((prev) => [...prev, ...pokemonDetails]);
            setOffset((prevOffset) => prevOffset + limit); 
            setIsLoading(false);
        } catch (error) {
            console.error(`Failed to fetch pokemons: ${error}`);
            setIsLoading(false);
            setHasMorePokemons(false);
        }
    }, [offset, hasMorePokemons, isLoading]);

    return { fetchPokemons, isLoading, setIsLoading, hasMorePokemons, pokemons };
};


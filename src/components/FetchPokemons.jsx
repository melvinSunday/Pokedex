import { useCallback, useState } from "react";

export const useFetchPokemons = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasMorePokemons, setHasMorePokemons] = useState(true);
    const [pokemons, setPokemons] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 13;

    const getPokemonDetails = async (pokemon) => {
        try {
            const [pokemonRes, speciesRes] = await Promise.all([
                fetch(pokemon.url),
                fetch(pokemon.url.replace("pokemon", "pokemon-species")),
            ]);

            if (!pokemonRes.ok || !speciesRes.ok) {
                console.warn(`Failed to fetch details for ${pokemon.name}`);
                return null;
            }

            const [pokemonData, speciesData] = await Promise.all([
                pokemonRes.json(),
                speciesRes.json(),
            ]);

            const pogoImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonData.id}.png`;
            const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`;

            const locationAreasRes = await fetch(pokemonData.location_area_encounters);
            if (!locationAreasRes.ok) return null;

            const locationAreasData = await locationAreasRes.json();
            const locations = locationAreasData
                .map((area) =>
                    area.location_area.name
                        .replace(/-/g, " ")
                        .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))
                )
                .join(", ");

            const varieties = speciesData.varieties
                .map((variety) => variety.pokemon.name)
                .join(", ");

            const japaneseName =
                speciesData.names.find((name) => name.language.name === "ja")?.name || "Unknown";
            const japaneseRomaji =
                speciesData.names.find((name) => name.language.name === "roomaji")?.name || "Unknown";

            const stats = pokemonData.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {});

            const evolutions = await fetchEvolutionDetails(speciesData.evolution_chain.url);
            const initialMoves = await fetchMoves(pokemonData.moves);

            return {
                ...pokemonData,
                image: pogoImage,
                fallbackImage: officialArtwork,
                description: speciesData.flavor_text_entries
                    .find((entry) => entry.language.name === "en")
                    .flavor_text.replace(/\f/g, " "),
                habitat: speciesData.habitat?.name || "Unknown",
                shape: speciesData.shape.name || "Unknown",
                eggGroups: speciesData.egg_groups.map((group) => group.name).join(", "),
                captureRate: speciesData.capture_rate,
                location: locations,
                varieties,
                japaneseName,
                japaneseRomaji,
                stats,
                evolutions,
                moves: initialMoves,
                totalMoves: pokemonData.moves.length,
                isMythical: speciesData.is_mythical,
                isLegendary: speciesData.is_legendary,
                isBaby: speciesData.is_baby,
            };
        } catch (error) {
            console.warn(`Failed to fetch details for ${pokemon.name}: ${error.message}`);
            return null;
        }
    };

    const fetchEvolutionDetails = async (url) => {
        try {
            const res = await fetch(url);
            if (!res.ok) return [];

            const evolutionData = await res.json();
            let evoData = evolutionData.chain;
            const evolutions = [];

            do {
                const details = evoData.evolution_details[0];
                const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoData.species.name}`);

                if (!speciesRes.ok) return evolutions;

                const speciesData = await speciesRes.json();
                evolutions.push({
                    species_name: evoData.species.name,
                    min_level: details?.min_level,
                    trigger_name: details?.trigger?.name,
                    item: details?.item?.name,
                    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${speciesData.id}.png`,
                });

                evoData = evoData["evolves_to"][0];
            } while (evoData);

            return evolutions;
        } catch {
            return [];
        }
    };

    const fetchMoves = async (moves) => {
        try {
            const fetchedMoves = await Promise.all(
                moves.map(async (move) => {
                    const moveRes = await fetch(move.move.url);
                    if (!moveRes.ok) return null;

                    const moveData = await moveRes.json();
                    return {
                        name: move.move.name,
                        power: moveData.power,
                        pp: moveData.pp,
                        accuracy: moveData.accuracy,
                    };
                })
            );
            return fetchedMoves.filter(Boolean);
        } catch {
            return [];
        }
    };

    const fetchPokemons = useCallback(async () => {
        if (isLoading || !hasMorePokemons) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
            );
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const data = await response.json();
            if (data.results.length === 0) {
                setHasMorePokemons(false);
                setIsLoading(false);
                return;
            }

            const pokemonDetails = await Promise.all(
                data.results.map(getPokemonDetails)
            );
            setPokemons((prev) => [...prev, ...pokemonDetails.filter(Boolean)]);
            setOffset((prevOffset) => prevOffset + limit);
        } catch (error) {
            console.error(`Failed to fetch pokemons: ${error}`);
            setHasMorePokemons(false);
        } finally {
            setIsLoading(false);
        }
    }, [offset, isLoading, hasMorePokemons]);

    return { fetchPokemons, isLoading, setIsLoading, pokemons, hasMorePokemons };
};

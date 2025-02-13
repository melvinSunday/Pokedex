//custom hook
import { useCallback, useState } from "react";

export const useFetchPokemons = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [hasMorePokemons, setHasMorePokemons] = useState(true);
	const [pokemons, setPokemons] = useState([]);

	const fetchPokemons = useCallback(async (limit, currentOffset) => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`
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

			// Create cache for shared resources
			const evolutionChainCache = new Map();
			const moveCache = new Map();

			// Process all Pokémon in parallel
			const pokemonDetails = await Promise.all(
				data.results.map(async (pokemon) => {
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

						// Parallelize secondary requests
						const [locationAreasRes, evolutionChainRes] = await Promise.all([
							fetch(pokemonData.location_area_encounters),
							evolutionChainCache.has(speciesData.evolution_chain.url) 
								? Promise.resolve() 
								: fetch(speciesData.evolution_chain.url).then(res => res.json())
						]);

						// Cache evolution chain
						if (!evolutionChainCache.has(speciesData.evolution_chain.url)) {
							evolutionChainCache.set(
								speciesData.evolution_chain.url,
								evolutionChainRes
							);
						}

						// Process locations
						const locationAreasData = locationAreasRes.ok 
							? await locationAreasRes.json() 
							: [];

						// Lazy loading for moves
						const initialMoveCount = 15;
						const fetchMoves = async (offset = 0, limit = initialMoveCount) => {
							const movesToFetch = pokemonData.moves.slice(offset, offset + limit);
							return Promise.all(
								movesToFetch.map(async (move) => {
									if (moveCache.has(move.move.url)) {
										return moveCache.get(move.move.url);
									}
									const moveRes = await fetch(move.move.url);
									if (!moveRes.ok) return null;
									const moveData = await moveRes.json();
									const formattedMove = {
										name: move.move.name
											.replace(/-/g, " ")
											.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())),
										level_learned_at: move.version_group_details[0].level_learned_at,
										learn_method: move.version_group_details[0].move_learn_method.name,
										target: moveData.target.name,
										power: moveData.power,
										pp: moveData.pp,
										accuracy: moveData.accuracy,
									};
									moveCache.set(move.move.url, formattedMove);
									return formattedMove;
								})
							);
						};

						const initialMoves = await fetchMoves();

						return {
							...pokemonData,
							image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonData.id}.png`,
							fallbackImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`,
							description: speciesData.flavor_text_entries
								.find((entry) => entry.language.name === "en")
								?.flavor_text.replace(/\f/g, " ") || "No description available",
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
							location: locationAreasData
								.map((area) =>
									area.location_area.name
										.replace(/-/g, " ")
										.replace(/\w\S*/g, (w) =>
											w.replace(/^\w/, (c) => c.toUpperCase())
										)
								)
								.join(", "),
							varieties: speciesData.varieties
								.map((variety) => variety.pokemon.name)
								.join(", "),
							japaneseName:
								speciesData.names.find((name) => name.language.name === "ja")
									?.name || "Unknown",
							japaneseRomaji:
								speciesData.names.find(
									(name) => name.language.name === "roomaji"
								)?.name || "Unknown",
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
							evolutions: [],
							evolutionChain: evolutionChainCache.get(speciesData.evolution_chain.url),
							moves: initialMoves,
							fetchMoreMoves: fetchMoves,
							totalMoves: pokemonData.moves.length,
							isMythical: speciesData.is_mythical,
							isLegendary: speciesData.is_legendary,
							isBaby: speciesData.is_baby,
						};
					} catch (error) {
						console.warn(`Failed to fetch details for ${pokemon.name}: ${error.message}`);
						return null;
					}
				})
			);

			setPokemons((prev) => [...prev, ...pokemonDetails.filter(p => p !== null)]);
		} catch (error) {
			console.error(`Failed to fetch pokemons: ${error}`);
			setHasMorePokemons(false);
		}
		setIsLoading(false);
	}, []);

	return { fetchPokemons, isLoading, setIsLoading, hasMorePokemons, pokemons };
};
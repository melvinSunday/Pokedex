import PropTypes from "prop-types";
import PokemonCard from "./PokemonCard";
import { useContext } from "react";
import { PokemonContext } from "./Context/Context";

const PokemonList = ({ searchTerm, currentPage, pokemonsPerPage }) => {
  const { pokemons } = useContext(PokemonContext);
  const filteredPokemons = pokemons.filter(
    (pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pokemon.id.toString().includes(searchTerm)
  );

  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemons.slice(
    indexOfFirstPokemon,
    indexOfLastPokemon
  );

  if (currentPokemons.length === 0) {
    return <div className="mt-8 text-center">No Pokémon found.</div>;
  }

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentPokemons.map((pokemon) => (
        <PokemonCard
          key={pokemon.id}
          //About
          id={pokemon.id}
          name={pokemon.name}
          number={pokemon.id}
          image={pokemon.image}
          fallbackImage={pokemon.fallbackImage}
          types={pokemon.types.map((type) => type.type.name)}
          description={pokemon.description}
          habitat={pokemon.habitat}
          shape={pokemon.shape}
          eggGroups={pokemon.eggGroups}
          height={pokemon.height}
          weight={pokemon.weight}
          varieties={pokemon.varieties}
          captureRate={pokemon.captureRate}
          isBaby={pokemon.isBaby || false}
          isMythical={pokemon.isMythical || false}
          isLegendary={pokemon.isLegendary || false}
          location={pokemon.location}
          japaneseName={pokemon.japaneseName}
          japaneseRomaji={pokemon.japaneseRomaji}
          //Base Stats
          hp={pokemon.hp}
          attack={pokemon.attack}
          defense={pokemon.defense}
          specialAttack={pokemon.specialAttack}
          specialDefense={pokemon.specialDefense}
          speed={pokemon.speed}
          //Evolution
          evolutions={pokemon.evolutions}
          evolutionChain={
            Array.isArray(pokemon.evolutionChain) ? pokemon.evolutionChain : []
          }
          //Moves
          moves={pokemon.moves}
        />
      ))}
    </div>
  );
};

PokemonList.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  currentPage: PropTypes.number.isRequired,
  pokemonsPerPage: PropTypes.number.isRequired,
};

export default PokemonList;

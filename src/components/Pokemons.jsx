import { useState, Suspense, useContext } from "react";
import Pagination from "./Pagination";
import PropTypes from "prop-types";
import { PokemonContext } from "./Context/Context";
import PokemonList from "./PokemonList";
import LoadingSkeleton from "./LoadingSkeleton";

const Pokemons = ({ searchTerm }) => {
  const { pokemons, isLoading } = useContext(PokemonContext);
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 30;
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  const filteredPokemons = pokemons.filter(
    (pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pokemon.id.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPokemons.length / pokemonsPerPage);

  return (
    <Suspense
      fallback={
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      }
    >
      <PokemonList
        pokemons={pokemons}
        searchTerm={searchTerm}
        currentPage={currentPage}
        pokemonsPerPage={pokemonsPerPage}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Suspense>
  );
};

Pokemons.propTypes = {
  searchTerm: PropTypes.string.isRequired,
};

export default Pokemons;

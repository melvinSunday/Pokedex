import { useState, useContext, useRef, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { PokemonContext } from "./Context/Context";
import PokemonCard from "./PokemonCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { debounce } from 'lodash';  // Make sure to install lodash if not already installed

const Pokemons = ({ searchTerm }) => {
  const { pokemons, isLoading } = useContext(PokemonContext);
  const [visiblePokemons, setVisiblePokemons] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const observerRef = useRef();
  const pokemonRefs = useRef({});

  // Debounce the search term update
  useEffect(() => {
    const debouncedSearch = debounce((term) => {
      setDebouncedSearchTerm(term);
    }, 300);  // Adjust the delay as needed

    debouncedSearch(searchTerm);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const filteredPokemons = useMemo(() => {
    if (!debouncedSearchTerm) return pokemons;
    
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return pokemons.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(lowercasedTerm) ||
        pokemon.id.toString().includes(lowercasedTerm)
    );
  }, [pokemons, debouncedSearchTerm]);

  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const pokemonId = entry.target.dataset.id;
        setVisiblePokemons((prev) => [...new Set([...prev, pokemonId])]);
      }
    });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, { rootMargin: "100px" });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);

  useEffect(() => {
    Object.values(pokemonRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [filteredPokemons]);

  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPokemons.map((pokemon) => (
        <div
          key={pokemon.id}
          ref={(el) => (pokemonRefs.current[pokemon.id] = el)}
          data-id={pokemon.id}
        >
          {(visiblePokemons.includes(pokemon.id.toString()) || debouncedSearchTerm) ? (
            <PokemonCard
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
              hp={pokemon.hp}
              attack={pokemon.attack}
              defense={pokemon.defense}
              specialAttack={pokemon.specialAttack}
              specialDefense={pokemon.specialDefense}
              speed={pokemon.speed}
              evolutions={pokemon.evolutions}
              evolutionChain={
                Array.isArray(pokemon.evolutionChain) ? pokemon.evolutionChain : []
              }
              moves={pokemon.moves}
            />
          ) : (
            <LoadingSkeleton />
          )}
        </div>
      ))}
    </div>
  );
};

Pokemons.propTypes = {
  searchTerm: PropTypes.string.isRequired,
};

export default Pokemons;
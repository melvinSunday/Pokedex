import { useState, useContext, useRef, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { PokemonContext } from "./Context/Context";
import PokemonCard from "./PokemonCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { debounce } from 'lodash';

const Pokemons = ({ searchTerm }) => {
  const { pokemons, isLoading, loadMorePokemons, searchPokemons, searchResults, hasMorePokemons } = useContext(PokemonContext);
  const [visiblePokemons, setVisiblePokemons] = useState(new Set());
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const observerRef = useRef();
  const loadMoreRef = useRef(null);
  const pokemonRefs = useRef({});

  useEffect(() => {
    const debouncedSearch = debounce((term) => {
      setDebouncedSearchTerm(term);
      searchPokemons(term);
    }, 300);  

    debouncedSearch(searchTerm);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, searchPokemons]);

  const displayedPokemons = useMemo(() => {
    return debouncedSearchTerm ? (searchResults.length > 0 ? searchResults : []) : pokemons;
  }, [debouncedSearchTerm, searchResults, pokemons]);

  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setVisiblePokemons((prev) => new Set(prev).add(entry.target.dataset.id));
      } else {
        setVisiblePokemons((prev) => {
          const newSet = new Set(prev);
          newSet.delete(entry.target.dataset.id);
          return newSet;
        });
      }
    });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "200px 0px",
      threshold: 0.1
    });

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
  }, [displayedPokemons]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !debouncedSearchTerm && hasMorePokemons) {
          loadMorePokemons();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMorePokemons, isLoading, debouncedSearchTerm, hasMorePokemons]);

  if (isLoading && pokemons.length === 0) {
    return (
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <LoadingSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (debouncedSearchTerm && displayedPokemons.length === 0) {
    return (
      <div className="mt-8 text-center text-xl font-semibold text-gray-700">
        No Pokémon found matching &quot;{debouncedSearchTerm}&quot;.
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedPokemons.map((pokemon, index) => {
        if (!pokemon || !pokemon.id) {
          return null; // Skip rendering if pokemon or pokemon.id is undefined
        }
        const uniqueKey = `${pokemon.id}-${index}`;
        return (
          <div
            key={uniqueKey}
            ref={(el) => (pokemonRefs.current[uniqueKey] = el)}
            data-id={uniqueKey}
          >
            {visiblePokemons.has(uniqueKey) || debouncedSearchTerm ? (
              <PokemonCard
                id={pokemon.id}
                name={pokemon.name}
                number={pokemon.id}
                image={pokemon.image}
                fallbackImage={pokemon.fallbackImage}
                types={pokemon.types?.map((type) => type.type.name) || []}
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
              <LoadingSkeleton /> // Replace the placeholder div with LoadingSkeleton
            )}
          </div>
        );
      })}
      {!debouncedSearchTerm && hasMorePokemons && <div ref={loadMoreRef} style={{ height: "20px" }} />}
      {isLoading && displayedPokemons.length > 0 && (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={`bottom-skeleton-${index}`} />
          ))}
        </>
      )}
      {!hasMorePokemons && !debouncedSearchTerm && (
        <div className="col-span-full text-center text-xl font-semibold text-gray-700 mt-8">
          You&apos;ve reached the end of the Pokédex!
        </div>
      )}
    </div>
  );
};

Pokemons.propTypes = {
  searchTerm: PropTypes.string.isRequired,
};

export default Pokemons;
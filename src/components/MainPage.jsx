import { useState } from "react";
import Pokemons from "./Pokemons";
import SearchBar from "./SearchBar";

const MainPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => setSearchTerm(term);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-800 to-white">
      <div className="container mx-auto p-5">
        <h1 className="text-4xl font-bold tracking-tight text-center text-white mb-2">
          <span className="text-red-500">Poké</span><span className="text-blue-500">dex</span>
        </h1>
        <p className="text-lg font-medium text-gray-300 mb-6 text-center">
          <span className="text-yellow-500">Discover</span> the vast world of Pokémon by searching for their names or National Pokédex numbers.
        </p>

        <SearchBar onSearch={handleSearch} />

        <Pokemons searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default MainPage;
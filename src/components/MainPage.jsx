import { useState } from "react";
import Pokemons from "./Pokemons";
import SearchBar from "./SearchBar";
import { FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MainPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const handleSearch = (term) => setSearchTerm(term);
  const toggleInfo = () => setShowInfo(!showInfo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl font-bold tracking-tight text-center text-white mb-2">
            <span className="text-red-500">Poké</span><span className="text-blue-500">dex</span>
          </h1>
          <p className="text-lg font-medium text-gray-300 text-center">
            <span className="text-yellow-500">Discover</span> the vast world of Pokémon by searching for their names or National Pokédex numbers.
          </p>
        </motion.div>

        <div className="flex items-center justify-center mb-4 relative">
          <div className="w-full max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
          <motion.button
            onClick={toggleInfo}
            className=" text-gray-200 hover:text-white transition-colors duration-200 animate-pulse"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))",
              animation: "pulse 2s infinite"
            }}
          >
            <FaInfoCircle size={30} />
          </motion.button>
        </div>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-4 mb-8 text-gray-200 max-w-2xl mx-auto"
            >
              <p className="text-sm text-center">
                Click on any Pokémon card to see more detailed information.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <Pokemons searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default MainPage;
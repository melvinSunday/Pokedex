import { useState, useCallback, useEffect } from "react";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFixed, setIsFixed] = useState(false);

  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isFixed ? (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 py-3 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"
        >
          <div className="container mx-auto px-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search Pokémon"
                className="w-full pl-10 pr-10 py-2 rounded-full bg-opacity-20 bg-white backdrop-filter backdrop-blur-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-300 ease-in-out"
              />
              <IoSearchOutline className="absolute left-3 text-gray-300 text-xl" />
              {searchTerm && (
                <IoCloseOutline
                  className="absolute right-3 text-gray-300 text-xl cursor-pointer"
                  onClick={handleClearSearch}
                />
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="py-3">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search Pokémon"
                className="w-full pl-10 pr-10 py-2 rounded-full bg-opacity-20 bg-white backdrop-filter backdrop-blur-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-300 ease-in-out"
              />
              <IoSearchOutline className="absolute left-3 text-gray-300 text-xl" />
              {searchTerm && (
                <IoCloseOutline
                  className="absolute right-3 text-gray-300 text-xl cursor-pointer"
                  onClick={handleClearSearch}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
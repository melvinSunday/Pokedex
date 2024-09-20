
import { useContext } from 'react';
import { PokemonContext } from './Context/Context';

const Pagination = () => {
  const { currentPage, totalPages, goToNextPage, goToPreviousPage } = useContext(PokemonContext);

  return (
    <div className="flex justify-center mt-8 items-center">
      <button
        className="px-4 py-2 bg-[#989898] text-white rounded-full mr-2 hover:bg-green-600 transition-colors duration-300 shadow-md"
        onClick={() => goToPreviousPage()}
        disabled={currentPage === 1}
      >
        First
      </button>
      <button
        className="px-4 py-2 bg-[#989898] text-white rounded-full mr-2 hover:bg-blue-600 transition-colors duration-300 shadow-md"
        onClick={() => goToPreviousPage()}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="px-4 py-2 bg-blue-300 text-black rounded-full font-bold">
        {currentPage} / {totalPages}
      </span>
      <button
        className="px-4 py-2 bg-[#444444c4] text-white rounded-full ml-2 hover:bg-blue-600 transition-colors duration-300 shadow-md"
        onClick={() => goToNextPage()}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <button
        className="px-4 py-2 bg-[#444444c4] text-white rounded-full ml-2 hover:bg-red-600 transition-colors duration-300 shadow-md"
        onClick={() => goToNextPage()}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
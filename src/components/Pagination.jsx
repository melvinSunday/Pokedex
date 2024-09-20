import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-8 items-center">
      <button
        className="px-4 py-2 bg-[#989898] text-white rounded-full mr-2 hover:bg-green-600 transition-colors duration-300 shadow-md"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        First
      </button>
      <button
        className="px-4 py-2 bg-[#989898] text-white rounded-full mr-2 hover:bg-blue-600 transition-colors duration-300 shadow-md"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="px-4 py-2 bg-blue-300 text-black rounded-full font-bold">
        {currentPage} / {totalPages}
      </span>
      <button
        className="px-4 py-2 bg-[#444444c4] text-white rounded-full ml-2 hover:bg-blue-600 transition-colors duration-300 shadow-md"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <button
        className="px-4 py-2 bg-[#444444c4] text-white rounded-full ml-2 hover:bg-red-600 transition-colors duration-300 shadow-md"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
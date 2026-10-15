import PropTypes from "prop-types";
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";

const SearchBar = ({ value, onChange }) => (
  <label className="search-field">
    <HiOutlineMagnifyingGlass className="search-field__icon" aria-hidden="true" />
    <span className="sr-only">Search Pokémon by name or National Pokédex number</span>
    <input
      id="pokemon-search"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search by name or Pokédex number…"
      autoComplete="off"
      spellCheck="false"
      aria-label="Search Pokémon by name or National Pokédex number"
    />
    {value ? (
      <button
        className="search-field__clear"
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
      >
        <HiOutlineXMark aria-hidden="true" />
      </button>
    ) : (
      <span className="search-field__hint" aria-hidden="true">⌘ K</span>
    )}
  </label>
);

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchBar;

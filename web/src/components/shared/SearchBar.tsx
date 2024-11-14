import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  searchTerm: string;
  onChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onChange }) => (
  <div className="relative">
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded pl-10"
      placeholder="Search Groups..."
    />
    <FaSearch className="absolute left-3 top-2 text-gray-500" />
  </div>
);

export default SearchBar;

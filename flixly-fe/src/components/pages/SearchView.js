import { useParams } from "react-router-dom";

const SearchView = () => {
  const { searchTerm } = useParams();

  return (
    <p>
      Showing matches for “<strong>{searchTerm}</strong>”
    </p>
  );
};

export default SearchView;

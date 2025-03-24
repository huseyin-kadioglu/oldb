import PhotoFrame from "../frame/PhotoFrame";
import "./Content.css";
import FrameBlock from "../common/FrameBlock";

const Content = () => {
  // db'den alınacak.
  const bookCovers = [
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg",
      title: "1984 - George Orwell",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_UF1000,1000_QL80_.jpg",
      title: "Brave New World - Aldous Huxley",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81A-mvlo+QL._AC_UF1000,1000_QL80_.jpg",
      title: "The Catcher in the Rye - J.D. Salinger",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/71jG%2Be7roXL._AC_UF1000,1000_QL80_.jpg",
      title: "The Great Gatsby - F. Scott Fitzgerald",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81VStYnDGrL._AC_UF1000,1000_QL80_.jpg",
      title: "Pride and Prejudice - Jane Austen",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/91hhCXj9dbL._AC_UF1000,1000_QL80_.jpg",
      title: "Crime and Punishment - Fyodor Dostoevsky",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81af+MCATTL._AC_UF1000,1000_QL80_.jpg",
      title: "The Hobbit - J.R.R. Tolkien",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
      title: "The Lord of the Rings - J.R.R. Tolkien",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg",
      title: "1984 - George Orwell",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_UF1000,1000_QL80_.jpg",
      title: "Brave New World - Aldous Huxley",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81A-mvlo+QL._AC_UF1000,1000_QL80_.jpg",
      title: "The Catcher in the Rye - J.D. Salinger",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/71jG%2Be7roXL._AC_UF1000,1000_QL80_.jpg",
      title: "The Great Gatsby - F. Scott Fitzgerald",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81VStYnDGrL._AC_UF1000,1000_QL80_.jpg",
      title: "Pride and Prejudice - Jane Austen",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/91hhCXj9dbL._AC_UF1000,1000_QL80_.jpg",
      title: "Crime and Punishment - Fyodor Dostoevsky",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81af+MCATTL._AC_UF1000,1000_QL80_.jpg",
      title: "The Hobbit - J.R.R. Tolkien",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg",
      title: "1984 - George Orwell",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_UF1000,1000_QL80_.jpg",
      title: "Brave New World - Aldous Huxley",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81A-mvlo+QL._AC_UF1000,1000_QL80_.jpg",
      title: "The Catcher in the Rye - J.D. Salinger",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/71jG%2Be7roXL._AC_UF1000,1000_QL80_.jpg",
      title: "The Great Gatsby - F. Scott Fitzgerald",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81VStYnDGrL._AC_UF1000,1000_QL80_.jpg",
      title: "Pride and Prejudice - Jane Austen",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/91hhCXj9dbL._AC_UF1000,1000_QL80_.jpg",
      title: "Crime and Punishment - Fyodor Dostoevsky",
    },
    {
      imageUrl:
        "https://m.media-amazon.com/images/I/81af+MCATTL._AC_UF1000,1000_QL80_.jpg",
      title: "The Hobbit - J.R.R. Tolkien",
    },
  ];

  return (
    <div className="container">
      <h2>Welcome back!</h2>
      <FrameBlock title = "Popular Films"></FrameBlock>

    </div>
  );
};
export default Content;

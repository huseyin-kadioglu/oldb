import "./Image.css";

const Image = ({ className = "profile-img" }) => {
  return <img src="/pp.jpg" alt="Profile" className={className} />;
};
export default Image;

import "./Author.css";

const AuthorProgressBar = ({ totalBooks, readBooks }) => {
  const percentage = totalBooks > 0 ? (readBooks / totalBooks) * 100 : 0;

  return (
    <div>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="progress-text">{`${Math.round(percentage)}% read`}</div>
    </div>
  );
};
export default AuthorProgressBar;

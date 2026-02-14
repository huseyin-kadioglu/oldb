import React from "react";

const AuthorProgressBar = ({ totalBooks, readBooks }) => {
  const percentage = totalBooks === 0 ? 0 : Math.round((readBooks / totalBooks) * 100);

  return (
    <div className="author-progress-wrap">
      <div className="author-progress-bar-container">
        <div className="author-progress-bar" style={{ width: `${percentage}%` }} />
      </div>
      <span className="author-progress-text">{readBooks}/{totalBooks}</span>
    </div>
  );
};

export default AuthorProgressBar;

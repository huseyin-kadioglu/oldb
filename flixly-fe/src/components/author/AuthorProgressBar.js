import React from "react";

const AuthorProgressBar = ({ totalBooks, readBooks }) => {
  const percentage = totalBooks === 0 ? 0 : Math.round((readBooks / totalBooks) * 100);

  return (
    <div style={{ width: "100%", maxWidth: 200 }}>
      <div className="author-progress-bar-container">
        <div className="author-progress-bar" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="author-progress-text">
        {`${readBooks} / ${totalBooks} kitap okundu (${percentage}%)`}
      </div>
    </div>
  );
};

export default AuthorProgressBar;

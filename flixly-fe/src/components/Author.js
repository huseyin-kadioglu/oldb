import { useEffect, useState } from "react";
import FrameBlock from "./common/FrameBlock";
import { getBooks } from "../service/APIService";

const Author = () => {
  const user = "huseyinkadioglu";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>AUTHOR PIC RATE</div>
    </div>
  );
};
export default Author;

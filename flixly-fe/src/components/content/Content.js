import PhotoFrame from "../frame/PhotoFrame";
import "./Content.css";
import FrameBlock from "../common/FrameBlock";
import { Link } from "react-router-dom";

const Content = () => {
  const user = "huseyinkadioglu";

  return (
    <div className="container">
      <h2>
        Welcome back,{" "}
        <span>
          <Link to={"/profile"}>{user}</Link>
        </span>
        . Here’s what we’ve been reading...
      </h2>
      <FrameBlock title="Popular Films"></FrameBlock>
    </div>
  );
};
export default Content;

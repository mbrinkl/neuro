import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div>
      <p>404</p>
      <Link to="/">Home</Link>
    </div>
  );
};

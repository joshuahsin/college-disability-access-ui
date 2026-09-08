import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>Page not found</h1>
      <p>
        <Link to="/venues">Back to venues</Link>
      </p>
    </div>
  );
}

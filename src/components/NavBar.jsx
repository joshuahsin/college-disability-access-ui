import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="nav-bar">
      <Link to="/" className="nav-brand">
        Campus Access
      </Link>
      {isAuthenticated && (
        <nav aria-label="Primary">
          <span className="nav-username">Signed in as {username}</span>
          <button type="button" onClick={handleLogout} className="btn btn-ghost">
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { isAuthenticated, isStaff, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.startsWith("/admin");

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
          {isStaff && (
            <Link to={isAdminView ? "/venues" : "/admin"} className="btn btn-ghost btn-small">
              {isAdminView ? "Switch to user view" : "Switch to admin view"}
            </Link>
          )}
          <span className="nav-username">Signed in as {username}</span>
          <button type="button" onClick={handleLogout} className="btn btn-ghost">
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}

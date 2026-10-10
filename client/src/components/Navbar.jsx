import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">🏠 EstateHub</Link>
        <nav className="nav-links">
          <NavLink to="/properties">Browse</NavLink>
          {user && <NavLink to="/favorites">Favorites</NavLink>}
          {user && (user.role === 'owner' || user.role === 'admin') && <NavLink to="/dashboard">My Listings</NavLink>}
          {user && user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <span className="user-chip">{user.name} <small>({user.role})</small></span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn btn-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

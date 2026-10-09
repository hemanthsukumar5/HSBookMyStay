import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingCart, FiList, FiPlusCircle, FiSettings, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="navbar-brand">
        <div className="navbar-brand-icon">B</div>
        DHSBookMyStay
      </Link>

      <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className={isActive('/')}>
          <FiHome /> Home
        </Link>
        <Link to="/rooms" className={isActive('/rooms')}>
          <FiGrid /> Rooms
        </Link>

        {user && (
          <Link to="/cart" className={isActive('/cart')} style={{ position: 'relative' }}>
            <FiShoppingCart /> Cart
            {cartItemCount > 0 && (
              <span className="navbar-cart-badge">{cartItemCount}</span>
            )}
          </Link>
        )}

        {user && (
          <Link to="/orders" className={isActive('/orders')}>
            <FiList /> My Orders
          </Link>
        )}

        {user?.user_type === 'host' && (
          <>
            <Link to="/host" className={isActive('/host')}>
              <FiSettings /> Dashboard
            </Link>
            <Link to="/host/rooms" className={isActive('/host/rooms')}>
              <FiPlusCircle /> My Rooms
            </Link>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" className={isActive('/login')}>
              <FiUser /> Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="navbar-user-info">
              <span>{user.username}</span>
              <div className="navbar-user-avatar">{user.username?.[0]?.toUpperCase()}</div>
            </div>
            <button className="navbar-btn-logout" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

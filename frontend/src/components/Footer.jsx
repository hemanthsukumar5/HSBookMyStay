import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">BookMyStay</div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
        </div>
      </div>
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} BookMyStay. All rights reserved to Hemanth Sukumar.
      </div>
    </footer>
  );
}

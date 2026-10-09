import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suites, setSuites] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suitesLoading, setSuitesLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await apiFetch('/api/rooms/?page_size=6', { auth: false });
        setRooms(res.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  useEffect(() => {
    async function fetchSuites() {
      if (!user) {
        setSuites([]);
        setSuitesLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/api/rooms/?is_suite=true&page_size=6');
        setSuites(res.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSuitesLoading(false);
      }
    }
    fetchSuites();
  }, [user]);

  return (
    <>
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-content">
          <span className="hero-badge">✦ Premium Hospitality</span>
          <h1>Discover Your Perfect Stay</h1>
          <p>
            From serene beach resorts to majestic heritage hotels, find luxury accommodations
            handpicked across India's finest destinations.
          </p>
          <button className="hero-cta" onClick={() => navigate('/rooms')}>
            Explore All Rooms <FiArrowRight />
          </button>
        </div>
      </section>

      {/* Premium Suites Section */}
      <section className="suites-section" id="premium-suites-section">
        <div className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">✦ Premium Suites</h2>
              <p className="section-subtitle">Exclusive members-only luxury experiences</p>
            </div>
            {user && (
              <Link to="/rooms" className="btn btn-outline btn-sm">
                View All <FiArrowRight />
              </Link>
            )}
          </div>

          {!user ? (
            <div className="suites-login-banner">
              <h3>Members-Only Access</h3>
              <p>Sign in to unlock our exclusive collection of premium suites and luxury accommodations.</p>
              <Link to="/login">Sign In to View Suites</Link>
            </div>
          ) : suitesLoading ? (
            <LoadingSpinner text="Loading premium suites..." />
          ) : (
            <div className="suites-grid">
              {suites.map(suite => (
                <div
                  key={suite.id}
                  className="suite-card"
                  onClick={() => navigate(`/rooms/${suite.id}`)}
                  id={`suite-card-${suite.id}`}
                >
                  <div className="suite-card-image">
                    <img src={suite.imageUrl} alt={suite.title} loading="lazy" />
                    <span className="suite-badge">Premium Suite</span>
                  </div>
                  <div className="suite-card-body">
                    <h3 className="suite-card-title">{suite.title}</h3>
                    <p className="suite-card-hotel">{suite.hotel} • {suite.city}</p>
                    <div className="suite-card-footer">
                      <div className="suite-card-price">
                        ₹{Number(suite.price).toLocaleString('en-IN')} <span>/night</span>
                      </div>
                      <div className="suite-card-rating">
                        <FiStar size={14} /> {Number(suite.rating).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="section" id="featured-rooms-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Rooms</h2>
            <p className="section-subtitle">Popular accommodations chosen for you</p>
          </div>
          <Link to="/rooms" className="btn btn-outline btn-sm">
            Browse All <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading rooms..." />
        ) : (
          <div className="room-grid">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

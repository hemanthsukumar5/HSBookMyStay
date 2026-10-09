import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiStar, FiUsers, FiCheck, FiX, FiShoppingCart } from 'react-icons/fi';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function RoomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nights, setNights] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [similarRooms, setSimilarRooms] = useState([]);

  useEffect(() => {
    async function fetchRoom() {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/api/rooms/${id}/`);
        setRoom(res.data);

        // Fetch similar rooms
        try {
          const similarRes = await apiFetch(`/api/rooms/?category=${res.data.category}&page_size=4`, { auth: false });
          setSimilarRooms((similarRes.data.results || []).filter(r => r.id !== res.data.id).slice(0, 3));
        } catch {
          setSimilarRooms([]);
        }
      } catch (err) {
        if (err.status === 401) {
          setError('Please log in to view this room.');
        } else {
          setError(err.message || 'Failed to load room details');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (nights < 1) return;
    setAddingToCart(true);
    setSuccessMsg('');
    setError('');
    try {
      await addToCart(room.id, nights);
      setSuccessMsg(`Added ${nights} night(s) for "${room.title}" to cart!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading room details..." />;

  if (error && !room) {
    return (
      <div className="section">
        <ErrorMessage message={error} />
        <button className="btn btn-primary" onClick={() => navigate('/rooms')}>Back to Rooms</button>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="room-detail" id="room-detail-page">
      <div className="room-detail-grid">
        <div className="room-detail-image">
          <img src={room.imageUrl} alt={room.title} />
        </div>

        <div className="room-detail-info">
          <span className="room-detail-category">{room.category}</span>
          <h1 className="room-detail-title">{room.title}</h1>
          <p className="room-detail-hotel">{room.hotel}</p>
          <p className="room-detail-location">
            <FiMapPin size={16} /> {room.city}
          </p>

          <div className="room-detail-stats">
            <div className="room-detail-stat">
              <div className="room-detail-stat-value">
                <FiStar size={18} style={{ color: '#c9953c', marginRight: '4px' }} />
                {Number(room.rating).toFixed(1)}
              </div>
              <div className="room-detail-stat-label">{room.total_reviews} Reviews</div>
            </div>
            <div className="room-detail-stat">
              <div className="room-detail-stat-value">
                <FiUsers size={18} style={{ marginRight: '4px' }} />
                {room.max_guests}
              </div>
              <div className="room-detail-stat-label">Max Guests</div>
            </div>
          </div>

          <div className="room-detail-price">
            ₹{Number(room.price).toLocaleString('en-IN')} <span>/night</span>
          </div>

          <div className={`room-detail-availability ${room.availability ? 'available' : 'unavailable'}`}>
            {room.availability ? <><FiCheck size={16} /> Available</> : <><FiX size={16} /> Unavailable</>}
          </div>

          {error && <ErrorMessage message={error} />}
          {successMsg && <div className="success-message">{successMsg}</div>}

          <div className="room-detail-actions">
            <div className="nights-selector">
              <label htmlFor="nights-input">Nights:</label>
              <input
                id="nights-input"
                type="number"
                min="1"
                max="30"
                value={nights}
                onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <button
              className="btn btn-accent btn-lg"
              onClick={handleAddToCart}
              disabled={!room.availability || addingToCart}
              id="add-to-cart-btn"
            >
              <FiShoppingCart /> {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      <div className="room-detail-description">
        <h3>About this room</h3>
        <p>{room.description}</p>
      </div>

      {similarRooms.length > 0 && (
        <div className="similar-rooms" id="similar-rooms-section">
          <h3>Similar Rooms</h3>
          <div className="room-grid">
            {similarRooms.map(r => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

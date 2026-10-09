import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiStar, FiUsers } from 'react-icons/fi';

export default function RoomCard({ room }) {
  const navigate = useNavigate();

  return (
    <div className="room-card" onClick={() => navigate(`/rooms/${room.id}`)} id={`room-card-${room.id}`}>
      <div className="room-card-image">
        <img src={room.imageUrl} alt={room.title} loading="lazy" />
        <span className="room-card-category">{room.category}</span>
      </div>
      <div className="room-card-body">
        <h3 className="room-card-title">{room.title}</h3>
        <p className="room-card-hotel">{room.hotel}</p>
        <p className="room-card-city">
          <FiMapPin size={13} /> {room.city}
        </p>
        <div className="room-card-meta">
          <div className="room-card-price">
            ₹{Number(room.price).toLocaleString('en-IN')} <span>/night</span>
          </div>
          <div className="room-card-info">
            <span className="room-card-rating">
              <FiStar size={13} /> {Number(room.rating).toFixed(1)}
            </span>
            <span className="room-card-guests">
              <FiUsers size={13} /> {room.max_guests}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

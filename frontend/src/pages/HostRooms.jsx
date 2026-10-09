import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { apiFetch } from '../api';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function HostRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        if (searchQuery) params.set('search', searchQuery);
        const res = await apiFetch(`/api/host/rooms/?${params.toString()}`);
        setRooms(res.data.results || []);
        setTotalPages(res.data.total_pages || 1);
      } catch (err) {
        setError(err.message || 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [currentPage, searchQuery]);

  const handleDelete = async (roomId, roomTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${roomTitle}"?`)) return;
    try {
      await apiFetch(`/api/rooms/${roomId}/`, { method: 'DELETE' });
      setRooms(rooms.filter(r => r.id !== roomId));
    } catch (err) {
      setError(err.message || 'Failed to delete room');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  return (
    <div className="host-rooms-page" id="host-rooms-page">
      <div className="section-header">
        <h1>My Rooms</h1>
        <Link to="/host/rooms/new" className="btn btn-accent" id="add-room-btn">
          <FiPlus /> Add New Room
        </Link>
      </div>

      <div className="filters-bar" style={{ marginBottom: '24px' }}>
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search your rooms..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit"><FiSearch /></button>
        </form>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading your rooms..." />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="No rooms added yet"
          message="Start by adding your first room listing."
          actionText="Add Room"
          actionLink="/host/rooms/new"
        />
      ) : (
        <>
          {rooms.map(room => (
            <div key={room.id} className="host-room-item" id={`host-room-${room.id}`}>
              <div className="host-room-item-image">
                <img src={room.imageUrl} alt={room.title} />
              </div>
              <div className="host-room-item-details">
                <h3 className="host-room-item-title">{room.title}</h3>
                <p className="host-room-item-meta">
                  {room.hotel} • {room.city} • {room.category} • ₹{Number(room.price).toLocaleString('en-IN')}/night
                  {room.is_suite && <span className="suite-badge" style={{ marginLeft: '8px', position: 'static' }}>Suite</span>}
                </p>
              </div>
              <div className="host-room-item-actions">
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/host/rooms/${room.id}/edit`)}>
                  <FiEdit2 /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(room.id, room.title)}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}

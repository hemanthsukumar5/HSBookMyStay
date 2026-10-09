import { useState, useEffect, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import { apiFetch } from '../api';
import RoomCard from '../components/RoomCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['Hotels', 'Resorts', 'Homestays', 'Villas', 'Houseboats'];
const RATINGS = [
  { label: 'All Ratings', value: '' },
  { label: '4.5+ Stars', value: '4.5' },
  { label: '4.0+ Stars', value: '4.0' },
  { label: '3.5+ Stars', value: '3.5' },
];

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [category, setCategory] = useState('');
  const [hotel, setHotel] = useState('');
  const [rating, setRating] = useState('');
  const [ordering, setOrdering] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage);
      if (category) params.set('category', category);
      if (hotel) params.set('hotel', hotel);
      if (rating) params.set('rating', rating);
      if (ordering) params.set('ordering', ordering);
      if (searchQuery) params.set('search', searchQuery);

      const res = await apiFetch(`/api/rooms/?${params.toString()}`, { auth: false });
      setRooms(res.data.results || []);
      setTotalPages(res.data.total_pages || 1);
      setTotalCount(res.data.count || 0);
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [currentPage, category, hotel, rating, ordering, searchQuery]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, hotel, rating, ordering, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <section className="section" id="rooms-catalogue">
      <div className="section-header">
        <div>
          <h1 className="section-title">Room Catalogue</h1>
          <p className="section-subtitle">{totalCount} rooms available</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar" id="filters-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search rooms or hotels..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="search-input"
          />
          <button type="submit" id="search-button">
            <FiSearch />
          </button>
        </form>

        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            id="filter-category"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Hotel</label>
          <input
            className="filter-input"
            type="text"
            placeholder="Filter by hotel"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            id="filter-hotel"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Rating</label>
          <select
            className="filter-select"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            id="filter-rating"
          >
            {RATINGS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Sort</label>
          <select
            className="filter-select"
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            id="filter-ordering"
          >
            <option value="">Default</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading rooms..." />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon="🏨"
          title="No rooms found"
          message="Try adjusting your filters or search query."
        />
      ) : (
        <>
          <div className="room-grid">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}

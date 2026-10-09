import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CATEGORIES = ['Hotels', 'Resorts', 'Homestays', 'Villas', 'Houseboats'];

export default function HostRoomForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    hotel: '',
    city: '',
    max_guests: 2,
    category: 'Hotels',
    price: '',
    imageUrl: '',
    availability: true,
    description: '',
    is_suite: false,
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    async function fetchRoom() {
      try {
        const res = await apiFetch(`/api/rooms/${id}/`);
        const r = res.data;
        setForm({
          title: r.title || '',
          hotel: r.hotel || '',
          city: r.city || '',
          max_guests: r.max_guests || 2,
          category: r.category || 'Hotels',
          price: r.price || '',
          imageUrl: r.imageUrl || '',
          availability: r.availability ?? true,
          description: r.description || '',
          is_suite: r.is_suite || false,
        });
      } catch (err) {
        setError(err.message || 'Failed to load room');
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const body = {
      ...form,
      price: parseFloat(form.price),
      max_guests: parseInt(form.max_guests),
    };

    try {
      if (isEdit) {
        await apiFetch(`/api/rooms/${id}/`, { method: 'PATCH', body });
        setSuccess('Room updated successfully!');
        setTimeout(() => navigate('/host/rooms'), 1500);
      } else {
        await apiFetch('/api/rooms/', { method: 'POST', body });
        setSuccess('Room created successfully!');
        setTimeout(() => navigate('/host/rooms'), 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading room data..." />;

  return (
    <div className="room-form-page" id="room-form-page">
      <h1>{isEdit ? 'Edit Room' : 'Add New Room'}</h1>

      {error && <ErrorMessage message={error} />}
      {success && <div className="success-message">{success}</div>}

      <form className="room-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rf-title">Title</label>
          <input id="rf-title" name="title" value={form.title} onChange={handleChange} required placeholder="Room title" />
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="rf-hotel">Hotel</label>
            <input id="rf-hotel" name="hotel" value={form.hotel} onChange={handleChange} required placeholder="Hotel name" />
          </div>
          <div className="form-group">
            <label htmlFor="rf-city">City</label>
            <input id="rf-city" name="city" value={form.city} onChange={handleChange} required placeholder="City" />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="rf-guests">Maximum Guests</label>
            <input id="rf-guests" name="max_guests" type="number" min="1" value={form.max_guests} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="rf-category">Category</label>
            <select id="rf-category" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rf-price">Price per Night (₹)</label>
          <input id="rf-price" name="price" type="number" step="0.01" min="1" value={form.price} onChange={handleChange} required placeholder="e.g. 3500" />
        </div>

        <div className="form-group">
          <label htmlFor="rf-image">Image URL</label>
          <input id="rf-image" name="imageUrl" value={form.imageUrl} onChange={handleChange} required placeholder="https://..." />
        </div>

        <div className="form-group">
          <label htmlFor="rf-description">Description</label>
          <textarea id="rf-description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the room..." />
        </div>

        <div className="form-checkbox">
          <input id="rf-available" name="availability" type="checkbox" checked={form.availability} onChange={handleChange} />
          <label htmlFor="rf-available">Available for booking</label>
        </div>

        <div className="form-checkbox">
          <input id="rf-suite" name="is_suite" type="checkbox" checked={form.is_suite} onChange={handleChange} />
          <label htmlFor="rf-suite">Premium Suite</label>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/host/rooms')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} id="save-room-btn">
            {submitting ? 'Saving...' : isEdit ? 'Update Room' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  );
}

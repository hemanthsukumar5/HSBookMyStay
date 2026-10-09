import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await apiFetch(`/api/orders/${id}/`);
        setOrder(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setError('');
    try {
      const res = await apiFetch(`/api/orders/${id}/cancel/`, { method: 'POST' });
      setOrder(res.data);
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading order details..." />;
  if (error && !order) {
    return (
      <div className="section">
        <ErrorMessage message={error} />
        <button className="btn btn-primary" onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    );
  }
  if (!order) return null;

  const canCancel = !['delivered', 'cancelled'].includes(order.status);

  return (
    <div className="order-detail-page" id="order-detail-page">
      <div className="order-detail-header">
        <div>
          <h1>Order #{order.id}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`status-badge ${order.status}`}>{order.status}</span>
          {canCancel && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling} id="cancel-order-btn">
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="order-detail-info">
        <div className="order-detail-info-grid">
          <div className="order-detail-info-item">
            <label>Full Name</label>
            <span>{order.full_name}</span>
          </div>
          <div className="order-detail-info-item">
            <label>Phone</label>
            <span>{order.phone_number}</span>
          </div>
          <div className="order-detail-info-item">
            <label>Address</label>
            <span>{order.street_address}, {order.city}, {order.state} - {order.pincode}</span>
          </div>
          <div className="order-detail-info-item">
            <label>Payment Method</label>
            <span>{order.payment_method}</span>
          </div>
          <div className="order-detail-info-item">
            <label>Meal Plan</label>
            <span>{order.meal_plan}</span>
          </div>
          <div className="order-detail-info-item">
            <label>Payment Status</label>
            <span style={{ color: order.is_paid ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {order.is_paid ? '✅ Paid' : '⏳ Pending'}
            </span>
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', margin: '24px 0 16px' }}>Booked Rooms</h3>

      {order.items?.map(item => (
        <div key={item.id} className="order-detail-item" id={`order-item-${item.id}`}>
          <div className="order-detail-item-image">
            <img src={item.imageUrl} alt={item.room_title} />
          </div>
          <div className="order-detail-item-info">
            <h4 className="order-detail-item-title">{item.room_title}</h4>
            <p className="order-detail-item-meta">
              {item.hotel} • {item.city} • {item.quantity} night(s)
            </p>
            <span className={`status-badge ${item.status}`}>{item.status}</span>
          </div>
          <div className="order-detail-item-price">
            ₹{Number(item.subtotal).toLocaleString('en-IN')}
          </div>
        </div>
      ))}

      <div className="cart-summary" style={{ marginTop: '24px' }}>
        <div className="cart-summary-row total">
          <span>Order Total</span>
          <span>₹{Number(order.total_price).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button className="btn btn-outline" onClick={() => navigate('/orders')}>← Back to Orders</button>
      </div>
    </div>
  );
}

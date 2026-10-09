import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiList } from 'react-icons/fi';
import { apiFetch } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await apiFetch('/api/orders/');
        setOrders(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your orders..." />;

  return (
    <div className="orders-page" id="orders-page">
      <h1><FiList style={{ marginRight: '8px' }} /> My Orders</h1>

      {error && <ErrorMessage message={error} />}

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          message="Start browsing rooms and make your first booking!"
          actionText="Browse Rooms"
          actionLink="/rooms"
        />
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            className="order-card"
            onClick={() => navigate(`/orders/${order.id}`)}
            id={`order-card-${order.id}`}
          >
            <div className="order-card-header">
              <span className="order-card-id">Order #{order.id}</span>
              <span className="order-card-date">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
            <div className="order-card-items">
              {order.items?.map(item => (
                <div key={item.id} className="order-card-item-thumb">
                  <img src={item.imageUrl} alt={item.room_title} />
                </div>
              ))}
            </div>
            <div className="order-card-footer">
              <span className="order-card-total">₹{Number(order.total_price).toLocaleString('en-IN')}</span>
              <span className={`status-badge ${order.status}`}>{order.status}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

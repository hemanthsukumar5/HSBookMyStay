import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const NEXT_STATUS = {
  placed: 'shipped',
  shipped: 'delivered',
};

export default function HostOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHostOrders() {
      try {
        const res = await apiFetch('/api/host/orders/');
        setItems(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchHostOrders();
  }, []);

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      const res = await apiFetch(`/api/host/order-items/${itemId}/status/`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      setItems(prev => prev.map(it => it.id === itemId ? res.data : it));
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner text="Loading host orders..." />;

  return (
    <div className="host-orders-page" id="host-orders-page">
      <h1>Host Orders</h1>

      {error && <ErrorMessage message={error} />}

      {items.length === 0 ? (
        <EmptyState icon="📋" title="No bookings yet" message="Your rooms haven't been booked yet." />
      ) : (
        <table className="host-order-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Room</th>
              <th>Guest</th>
              <th>Nights</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} id={`host-order-item-${item.id}`}>
                <td>#{item.order_id}</td>
                <td>{item.room_title}</td>
                <td>{item.guest_name}</td>
                <td>{item.quantity}</td>
                <td>₹{Number(item.subtotal).toLocaleString('en-IN')}</td>
                <td><span className={`status-badge ${item.status}`}>{item.status}</span></td>
                <td>
                  {NEXT_STATUS[item.status] ? (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusUpdate(item.id, NEXT_STATUS[item.status])}
                    >
                      Mark {NEXT_STATUS[item.status]}
                    </button>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {item.status === 'delivered' ? 'Completed' : 'Cancelled'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiCalendar, FiHome, FiClock } from 'react-icons/fi';
import { apiFetch } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function HostDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await apiFetch('/api/host/dashboard/');
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="section"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  const { summary, seven_day_sales, top_performing_rooms, items_by_status, still_to_confirm } = data;

  const maxRevenue = Math.max(...seven_day_sales.map(d => d.revenue), 1);

  return (
    <div className="dashboard" id="host-dashboard">
      <h1>Host Dashboard</h1>

      {/* Summary Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-icon revenue"><FiDollarSign size={24} /></div>
          <div className="stat-card-value">₹{Number(summary.total_revenue).toLocaleString('en-IN')}</div>
          <div className="stat-card-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon bookings"><FiCalendar size={24} /></div>
          <div className="stat-card-value">{summary.total_bookings}</div>
          <div className="stat-card-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon rooms"><FiHome size={24} /></div>
          <div className="stat-card-value">{summary.active_rooms}</div>
          <div className="stat-card-label">Active Rooms</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon pending"><FiClock size={24} /></div>
          <div className="stat-card-value">{summary.pending_confirmations}</div>
          <div className="stat-card-label">Pending Confirmations</div>
        </div>
      </div>

      {/* Still-to-confirm Bookings */}
      {still_to_confirm && still_to_confirm.length > 0 && (
        <div className="dashboard-panel" style={{ marginBottom: '24px' }}>
          <h3>⏳ Bookings to Confirm</h3>
          {still_to_confirm.map(item => (
            <div key={item.id} className="top-room-item">
              <div>
                <span className="top-room-name">{item.room_title}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                  Order #{item.order_id} • {item.guest_name}
                </span>
              </div>
              <span className="top-room-revenue">₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <Link to="/host/orders" className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>
            View All Orders →
          </Link>
        </div>
      )}

      <div className="dashboard-grid">
        {/* 7-Day Sales Chart */}
        <div className="dashboard-panel">
          <h3>📊 7-Day Sales</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {seven_day_sales.map((day, i) => {
                const height = maxRevenue > 0 ? Math.max(4, (day.revenue / maxRevenue) * 200) : 4;
                return (
                  <div key={i} className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: `${height}px` }}>
                      {day.revenue > 0 && (
                        <span className="chart-bar-value">₹{(day.revenue / 1000).toFixed(1)}k</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="chart-labels">
              {seven_day_sales.map((day, i) => (
                <span key={i} className="chart-label">{day.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: Top Rooms + Status */}
        <div>
          <div className="dashboard-panel" style={{ marginBottom: '16px' }}>
            <h3>🏆 Top Performing Rooms</h3>
            {top_performing_rooms.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No bookings yet</p>
            ) : (
              top_performing_rooms.map((room, i) => (
                <div key={i} className="top-room-item">
                  <div>
                    <span className="top-room-name">{room.room_title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                      {room.bookings_count} booking(s)
                    </span>
                  </div>
                  <span className="top-room-revenue">₹{Number(room.total_revenue).toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>

          <div className="dashboard-panel">
            <h3>📋 Items by Status</h3>
            <div className="status-breakdown">
              <div className="status-breakdown-item placed">
                <span>Placed</span>
                <span className="status-breakdown-count">{items_by_status.placed}</span>
              </div>
              <div className="status-breakdown-item shipped">
                <span>Shipped</span>
                <span className="status-breakdown-count">{items_by_status.shipped}</span>
              </div>
              <div className="status-breakdown-item delivered">
                <span>Delivered</span>
                <span className="status-breakdown-count">{items_by_status.delivered}</span>
              </div>
              <div className="status-breakdown-item cancelled">
                <span>Cancelled</span>
                <span className="status-breakdown-count">{items_by_status.cancelled}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

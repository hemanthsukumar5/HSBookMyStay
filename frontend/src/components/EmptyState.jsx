import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '📭', title = 'Nothing here', message = '', actionText, actionLink }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">{actionText}</Link>
      )}
    </div>
  );
}

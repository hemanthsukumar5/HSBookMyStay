import { FiAlertCircle } from 'react-icons/fi';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="error-message">
      <FiAlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}

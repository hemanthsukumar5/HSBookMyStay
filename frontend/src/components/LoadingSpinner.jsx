import { ClipLoader } from 'react-spinners';

export default function LoadingSpinner({ size = 40, color = '#1a365d', text = 'Loading...' }) {
  return (
    <div className="loading-container">
      <ClipLoader size={size} color={color} />
      {text && <p>{text}</p>}
    </div>
  );
}

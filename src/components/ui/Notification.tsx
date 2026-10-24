import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle } from 'lucide-react';

export function Notification() {
  const { notification } = useApp();
  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`}>
      {notification.type === 'success'
        ? <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
        : <XCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
      }
      <span>{notification.message}</span>
    </div>
  );
}

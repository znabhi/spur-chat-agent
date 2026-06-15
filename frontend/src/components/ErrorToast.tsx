import { useEffect, useState } from 'react';

interface Props {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`error-toast${visible ? '' : ' error-toast--hidden'}`}
    >
      <span>⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss error"
        className="error-dismiss"
      >
        ✕
      </button>
    </div>
  );
}

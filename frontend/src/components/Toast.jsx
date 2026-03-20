import { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000, index = 0 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Stagger the entrance animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);

    const hideTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 200);
    }, duration + (index * 50));

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose, index]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
    logout: '👋',
  };

  const styles = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    logout: 'bg-gray-50 text-gray-800 border border-gray-200',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    logout: 'text-gray-600',
  };

  // Don't render until visible
  if (!isVisible && !isExiting) {
    return null;
  }

  return (
    <div 
      className={`
        ${isExiting ? 'toast-exit' : 'toast-enter'} 
        flex items-center gap-3 p-3 rounded 
        ${styles[type]} 
        max-w-sm shadow-sm
      `}
    >
      <div className={`flex-shrink-0 ${iconColors[type]} text-sm font-medium`}>
        {icons[type]}
      </div>
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;

import { LiaCheckCircleSolid, LiaExclamationCircleSolid } from 'react-icons/lia';
import { useEffect } from 'react';
import clsx from 'clsx';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Notification = ({ message, type, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      className={clsx(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transition-all',
        isSuccess
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      )}
      dir="rtl"
    >
      {isSuccess ? (
        <LiaCheckCircleSolid className="w-5 h-5 text-green-600" />
      ) : (
        <LiaExclamationCircleSolid className="w-5 h-5 text-red-600" />
      )}
      <span
        className={clsx(
          'font-medium',
          isSuccess ? 'text-green-900' : 'text-red-900'
        )}
      >
        {message}
      </span>
    </div>
  );
};

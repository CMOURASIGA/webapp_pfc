
import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { ToastMessage, ToastType } from '../../types';

interface ToastProps {
  message: ToastMessage;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(message.id), 4000);
    return () => clearTimeout(timer);
  }, [message.id, onRemove]);

  const isSuccess = message.type === ToastType.SUCCESS;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4 min-w-[300px] animate-slide-in ${
      isSuccess ? 'bg-white border-green-500 text-gray-800' : 'bg-white border-red-500 text-gray-800'
    }`}>
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
      )}
      <p className="text-sm font-medium flex-1">{message.text}</p>
      <button onClick={() => onRemove(message.id)} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;

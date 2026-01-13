
import React from 'react';
import Toast from './Toast';
import { ToastMessage } from '../../types';

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {messages.map((m) => (
        <div key={m.id} className="pointer-events-auto">
          <Toast message={m} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

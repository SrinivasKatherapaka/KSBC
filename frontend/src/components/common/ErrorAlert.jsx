import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between text-red-400 mb-6">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-red-400 hover:text-red-300 font-bold ml-4">
          ✕
        </button>
      )}
    </div>
  );
};
export default ErrorAlert;

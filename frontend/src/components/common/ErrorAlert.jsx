import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-700 mb-6 shadow-sm">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
        <span className="text-sm font-semibold">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-red-500 hover:text-red-700 font-bold ml-4">
          ✕
        </button>
      )}
    </div>
  );
};
export default ErrorAlert;

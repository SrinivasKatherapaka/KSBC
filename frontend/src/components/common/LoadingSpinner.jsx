import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading banking intelligence...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className="w-10 h-10 text-[#dfbd84] animate-spin" />
      <span className="text-sm font-medium text-[#a4b8b5]">{text}</span>
    </div>
  );
};
export default LoadingSpinner;

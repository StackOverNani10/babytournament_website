import React from 'react';
import { X, Info } from 'lucide-react';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  variant?: 'info' | 'warning' | 'success' | 'danger';
  theme?: 'boy' | 'girl' | 'neutral';
}

const Alert: React.FC<AlertProps> = ({ isOpen, onClose, message, variant = 'info', theme = 'neutral' }) => {
  if (!isOpen) return null;

  const baseClasses = 'flex items-center p-4 mb-4 text-sm rounded-lg transition-colors duration-300';
  
  const getThemeClasses = () => {
    if (theme === 'boy') {
      return 'bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-500';
    } else if (theme === 'girl') {
      return 'bg-gradient-to-r from-pink-600 to-rose-600 border border-pink-500';
    }
    return 'bg-gradient-to-r from-gray-600 to-gray-700 border border-gray-500';
  };

  const getTextColor = () => {
    if (theme === 'boy') return 'text-blue-50';
    if (theme === 'girl') return 'text-pink-50';
    return 'text-gray-50';
  };
  
  const variantClasses = {
    info: getThemeClasses(),
    danger: 'bg-gradient-to-r from-red-600/90 to-red-700/90 border-red-500/50',
    success: 'bg-gradient-to-r from-green-600/90 to-green-700/90 border-green-500/50',
    warning: 'bg-gradient-to-r from-yellow-600/90 to-yellow-700/90 border-yellow-500/50',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} w-full max-w-2xl mx-auto`} role="alert">
      <div className="flex items-center">
        <Info className={`flex-shrink-0 w-4 h-4 mr-2 ${getTextColor()}`} />
        <span className="sr-only">Info</span>
        <div className={`text-sm font-medium ${getTextColor()}`}>
          {message}
        </div>
        <button
          type="button"
          className={`ml-auto -mr-1.5 -my-1.5 rounded-lg p-1 inline-flex items-center justify-center h-6 w-6 hover:bg-white/20 transition-colors ${getTextColor()} hover:bg-opacity-20`}
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Alert;

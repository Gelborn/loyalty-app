import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };

  const Icon = icons[type];

  const colors = {
    success: 'bg-green-500 border-green-400',
    error: 'bg-red-500 border-red-400',
    info: 'bg-blue-500 border-blue-400',
  };

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg border ${colors[type]} text-white shadow-lg animate-in slide-in-from-top-2 fade-in-0`}>
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
}
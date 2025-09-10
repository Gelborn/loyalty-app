import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    info: AlertCircle,
  }[type];

  // info agora em roxo
  const styles = {
    success: 'border-emerald-400 text-emerald-300',
    error: 'border-red-400 text-red-300',
    info: 'border-purple-400 text-purple-300',
  }[type];

  return (
    <div
      className={`
        fixed top-4 right-4 z-[9999]
        max-w-sm min-w-[280px]
        px-4 py-3 rounded-xl border
        bg-neutral-900/90 backdrop-blur
        shadow-xl
        animate-in slide-in-from-top-5 fade-in-0
        ${styles}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-[2px] shrink-0" size={18} />
        <p className="flex-1 text-sm text-white font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

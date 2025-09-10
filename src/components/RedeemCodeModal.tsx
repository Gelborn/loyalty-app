import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Gift, Copy, CheckCircle, X } from 'lucide-react';

interface RedeemCodeModalProps {
  isOpen: boolean;
  code: string | null;
  onClose: () => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const RedeemCodeModal: React.FC<RedeemCodeModalProps> = ({
  isOpen,
  code,
  onClose,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // trava scroll do body
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      setCopied(false);
    };
  }, [isOpen, onClose]);

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onToast?.('Código copiado!', 'success');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      onToast?.('Erro ao copiar código', 'error');
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      onMouseDown={(e) => {
        // fecha ao clicar fora do conteúdo
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-[1001] w-[92vw] max-w-md rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl border border-white/20">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Código de Desconto</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/20 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4 border border-white/20">
            <p className="text-2xl font-mono font-bold text-center tracking-wider select-all">
              {code}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copy}
              className="flex-1 bg-white/20 backdrop-blur text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copiado!' : 'Copiar código'}
            </button>
            <button
              onClick={onClose}
              className="bg-white/20 backdrop-blur text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/20"
            >
              Fechar
            </button>
          </div>

          <p className="text-sm text-white/90 text-center mt-3">
            Use este código no checkout para aplicar seu desconto.
          </p>
        </div>
      </div>
    </div>
  );

  // usa portal se houver #modal-root senão injeta no body
  const container =
    document.getElementById('modal-root') ?? document.body;

  return ReactDOM.createPortal(modal, container);
};

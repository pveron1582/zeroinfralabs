// ── components/DonationModal.tsx ─────────────────────────────────────
// Modal discreto para donaciones via Mercado Pago

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ isOpen, onClose }: Props) {
  const language = useLanguage();
  const isSpanish = language === 'es';
  const [copied, setCopied] = useState(false);
  const alias = 'pablo.m.veron.mp';

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(alias);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = alias;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
            <span>☕</span>
            {isSpanish ? 'Invitame un café' : 'Buy me a coffee'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <p className="text-sm text-gray-300 mb-1">
            {isSpanish ? '¿Te gusta el proyecto?' : 'Do you like this project?'}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {isSpanish
              ? 'Tu apoyo ayuda a mantener este proyecto activo y en mejora continua.'
              : 'Your support helps keep this project active and continuously improving.'}
          </p>

          {/* Mercado Pago */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-400">MP</span>
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Mercado Pago</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm text-emerald-400 font-mono bg-gray-900 px-3 py-1.5 rounded">{alias}</code>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors min-w-[70px]"
              >
                {copied
                  ? (isSpanish ? '✓ Copiado' : '✓ Copied')
                  : (isSpanish ? 'Copiar' : 'Copy')}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            {isSpanish
              ? 'Mercado Pago alias · Argentina 🇦🇷'
              : 'Mercado Pago alias · Argentina 🇦🇷'}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {isSpanish
              ? '¿Otro método de pago? Envianos un comentario.'
              : 'Want other payment options? Send us feedback.'}
          </p>
        </div>
      </div>
    </div>
  );
}

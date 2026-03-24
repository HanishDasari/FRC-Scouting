'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function Modal({ isOpen, type, title, message, onClose, onConfirm }: ModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={32} />;
      case 'error': return <AlertCircle className="text-rose-500" size={32} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={32} />;
      case 'confirm': return <AlertTriangle className="text-amber-500" size={32} />;
      default: return <Info className="text-blue-500" size={32} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#f43f5e';
      case 'warning': return '#f59e0b';
      case 'confirm': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="relative w-full max-w-sm p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-300"
        style={{ 
          background: '#13131a', 
          border: `1.5px solid ${getColor()}44`,
          boxShadow: `0 20px 50px -12px ${getColor()}33`
        }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 p-4 rounded-full bg-white/5">
            {getIcon()}
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-3">{title}</h3>
          <p className="text-sm font-bold leading-relaxed mb-8" style={{ color: '#94a3b8' }}>{message}</p>

          <div className="flex gap-3 w-full">
            {type === 'confirm' ? (
              <>
                <button 
                  onClick={onClose}
                  className="flex-1 p-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { onConfirm?.(); onClose(); }}
                  className="flex-1 p-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white transition-all active:scale-95"
                  style={{ background: getColor() }}
                >
                  Confirm
                </button>
              </>
            ) : (
              <button 
                onClick={() => { if (onConfirm) onConfirm(); onClose(); }}
                className="w-full p-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white transition-all active:scale-95"
                style={{ background: getColor() }}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

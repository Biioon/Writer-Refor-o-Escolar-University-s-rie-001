import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'warning';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, type = 'success' }) => {
  if (!isOpen) return null;

  const typeDetails = {
    success: { icon: CheckCircle, color: 'text-green-400' },
    error: { icon: XCircle, color: 'text-red-400' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400' },
  };

  const Icon = typeDetails[type].icon;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-stone-800 rounded-xl shadow-2xl w-full max-w-md m-4 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <div className="flex items-start gap-4">
                 <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-stone-800 ${typeDetails[type].color}`}>
                    <Icon size={24} />
                 </div>
                 <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <div className="mt-2">{children}</div>
                 </div>
                 <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-400 hover:bg-stone-700 hover:text-white transition-colors"
                    aria-label="Fechar"
                    >
                    <X size={20} />
                </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 rounded-lg font-semibold transition-colors bg-stone-700 text-gray-200 hover:bg-stone-600">
                    Cancelar
                </button>
                <button onClick={onClose} className="px-4 py-2 rounded-lg font-semibold transition-colors bg-purple-600 text-white hover:bg-purple-700">
                    Confirmar
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

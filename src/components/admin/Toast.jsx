import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = 'success', message } = toast;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 shrink-0" />
  };

  const borderStyles = {
    success: 'border-emerald-200 bg-white text-slate-800',
    error: 'border-rose-200 bg-white text-slate-800',
    info: 'border-blue-200 bg-white text-slate-800'
  };

  return (
    <div
      id="app-toast-alert"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-bottom-5 duration-200 max-w-sm bg-white"
    >
      {icons[type] || icons.success}
      <span className="text-xs font-semibold text-slate-800 flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

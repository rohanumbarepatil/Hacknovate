import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Toast notification system
 * Manages a queue of notification messages
 */

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
};

function ToastItem({ toast, onRemove }) {
  const Icon = iconMap[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg min-w-[320px] max-w-[420px]',
        colorMap[toast.type] || colorMap.info
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-white">{toast.title}</p>
        )}
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// Global toast state
let toastListeners = [];
let toasts = [];
let nextId = 0;

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

/**
 * Show a toast notification from anywhere in the app
 */
export function showToast({ type = 'info', title, message, duration = 4000 }) {
  const toast = { id: nextId++, type, title, message, duration };
  toasts = [...toasts, toast];
  notifyListeners();
}

export function removeToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

/**
 * Toast container — render once in App.jsx
 */
export default function ToastContainer() {
  const [localToasts, setLocalToasts] = useState([]);

  useEffect(() => {
    toastListeners.push(setLocalToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setLocalToasts);
    };
  }, []);

  const handleRemove = useCallback((id) => {
    removeToast(id);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {localToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={handleRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

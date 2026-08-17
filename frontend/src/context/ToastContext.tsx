import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: string; message: string; type: ToastType; }
interface ToastCtx { toast: (msg: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const icons: Record<ToastType, string> = {
  success: "✓", error: "✕", warning: "⚠", info: "ℹ",
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = `t${Date.now()}`;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{icons[t.type]}</span>
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

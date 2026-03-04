import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  temaEscuro?: boolean;
}

const Toast = ({ 
  message, 
  actionLabel, 
  onAction, 
  isVisible, 
  onClose, 
  duration = 4000,
  temaEscuro 
}: ToastProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setShouldRender(false);
          onClose();
        }, 300); // Wait for exit animation
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <div 
      className={`toast-container ${temaEscuro ? 'dark' : 'light'} ${isAnimating ? 'visible' : ''}`}
    >
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        {actionLabel && (
          <button 
            className="toast-action"
            onClick={() => {
              onAction?.();
              setIsAnimating(false);
              setTimeout(() => {
                setShouldRender(false);
                onClose();
              }, 300);
            }}
          >
            {actionLabel}
          </button>
        )}
        <button 
          className="toast-close"
          onClick={() => {
            setIsAnimating(false);
            setTimeout(() => {
              setShouldRender(false);
              onClose();
            }, 300);
          }}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
      
      {/* Barra de progresso do tempo */}
      <div 
        className="toast-progress"
        style={{ 
          animationDuration: `${duration}ms`,
          animationPlayState: isAnimating ? 'running' : 'paused'
        }}
      />
    </div>,
    document.body
  )
}

export default Toast

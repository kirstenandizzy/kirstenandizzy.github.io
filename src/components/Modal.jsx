import { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/Modal.scss';

export default function Modal({ isOpen, onClose, onCloseStart, closeDelay = 0, className = '', children }) {
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus-trap: keep Tab cycling within the modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleCloseRef.current();
      return;
    }
    if (e.key !== 'Tab') return;
    const container = containerRef.current;
    if (!container) return;
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const handleClose = () => {
    if (onCloseStart) onCloseStart();
    setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 250);
    }, closeDelay);
  };

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  // Auto-focus close button on open
  useEffect(() => {
    if (isOpen) {
      // Use a small timeout to ensure the portal DOM is painted
      const id = setTimeout(() => closeRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
      <div className={`modal__backdrop ${isClosing ? 'modal__backdrop--closing' : ''} ${className}`} onClick={handleClose} />
      <div className={`modal__content ${className}`} onPointerDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        <button ref={closeRef} className={`modal__close${isClosing ? ' modal__close--closing' : ''}`} onClick={handleClose} aria-label='Close modal'>
          ×
        </button>
        <div className={`modal__content-inner${isClosing ? ' modal__content-inner--closing' : ''}`} onPointerDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          {children}
        </div>
      </div>
    </div>
  );
}

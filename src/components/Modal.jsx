import { useState, useEffect, useRef } from 'react';
import '../styles/Modal.scss';

export default function Modal({ isOpen, onClose, onCloseStart, closeDelay = 0, className = '', children }) {
  const [isClosing, setIsClosing] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
      // Auto-focus close button so it's immediately tabbable
      requestAnimationFrame(() => {
        closeRef.current?.focus();
      });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (onCloseStart) onCloseStart(); // signal parent to start ocean collapse
    setTimeout(() => {
      setIsClosing(true); // modal close animation starts after closeDelay
      setTimeout(onClose, 250); // Match animation duration (0.25s fadeOut/scaleOut)
    }, closeDelay);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`modal__backdrop ${isClosing ? 'modal__backdrop--closing' : ''} ${className}`} onClick={handleClose} />
      <div className={`modal__content ${className}`} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        <button ref={closeRef} className={`modal__close${isClosing ? ' modal__close--closing' : ''}`} onClick={handleClose} aria-label='Close modal'>
          ×
        </button>
        <div className={`modal__content-inner${isClosing ? ' modal__content-inner--closing' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          {children}
        </div>
      </div>
    </>
  );
}

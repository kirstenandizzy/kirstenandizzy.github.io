import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setRsvpStatus } from '../store/weddingSlice';
import Modal from './Modal';
import CardStack from './CardStack';
import '../styles/CardStack.scss';

const CARDS = [
  { id: 'rsvp-form', type: 'form' },
];

function renderCard(card) {
  if (card.type === 'form') {
    return (
      <div className="card-stack__card card-stack__card--form">
        <h2>RSVP</h2>
        <p>Will you be attending?</p>
        {/* Future: name input, meal selection, +1, etc. */}
      </div>
    );
  }
  return null;
}

function Envelope({ closing }) {
  return (
    <div className={`envelope-wrapper${closing ? ' envelope-wrapper--closing' : ''}`}>
      <div className="envelope__back" />
      <div className="envelope__front" />
      <div className="envelope__opener" />
    </div>
  );
}

export default function RSVPOverlay({ isOpen, onClose, onCloseStart, closeDelay }) {
  const dispatch = useDispatch();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = useCallback((card) => {
    if (card.type === 'form') {
      dispatch(setRsvpStatus('accepted'));
      setAccepted(true);
    }
  }, [dispatch]);

  const handleReject = useCallback((card) => {
    if (card.type === 'form') {
      dispatch(setRsvpStatus('declined'));
    }
  }, [dispatch]);

  const stack = CardStack({
    cards: CARDS,
    renderCard,
    onAccept: handleAccept,
    onReject: handleReject,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} onCloseStart={onCloseStart} closeDelay={closeDelay} className="modal--rsvp">
      <div className="rsvp-content">
        <div className="rsvp-content__stage">
          {stack?.element}
          <Envelope closing={accepted && stack?.isDone} />
        </div>
        {!stack?.isDone && (
          <div className="rsvp-content__actions">
            <button
              className="rsvp-btn rsvp-btn--reject"
              onClick={stack?.reject}
              disabled={stack?.isAnimating}
              aria-label="Decline RSVP"
            >
              ✕
            </button>
            <button
              className="rsvp-btn rsvp-btn--accept"
              onClick={stack?.accept}
              disabled={stack?.isAnimating}
              aria-label="Accept RSVP"
            >
              ✓
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

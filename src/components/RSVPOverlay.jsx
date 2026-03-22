import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setRsvpStatus } from '../store/weddingSlice';
import submitRSVP from '../utils/submitRSVP';
import Modal from './Modal';
import CardStack from './CardStack';
import WaveText from './WaveText';
import '../styles/CardStack.scss';

const CARDS = [
  { id: 'rsvp-form', type: 'form' },
];

const GUEST_ROWS = 8;

function RSVPForm({ dataRef, submitting }) {
  const [names, setNames] = useState(() => Array.from({ length: GUEST_ROWS }, () => ''));
  const [checks, setChecks] = useState(
    () => Array.from({ length: GUEST_ROWS }, () => ({ yes: false, no: false }))
  );
  const [dietary, setDietary] = useState('');
  const [message, setMessage] = useState('');

  // Keep dataRef in sync with all form values (flat keys, same pattern as dietary/message)
  const syncRef = useCallback(() => {
    const flat = {};
    for (let i = 0; i < GUEST_ROWS; i++) {
      const n = i + 1;
      flat[`guest_${n}`] = names[i].trim();
      flat[`rsvp_${n}`] = checks[i].yes ? 'yes' : checks[i].no ? 'no' : '';
    }
    flat.dietary = dietary.trim();
    flat.message = message.trim();
    dataRef.current = flat;
  }, [names, checks, dietary, message, dataRef]);

  // Sync on every state change
  syncRef();

  const handleName = (i, value) => {
    setNames((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  const handleCheck = (row, field) => {
    setChecks((prev) => {
      const next = prev.map((r) => ({ ...r }));
      if (field === 'yes') {
        next[row] = { yes: !prev[row].yes, no: false };
      } else {
        next[row] = { yes: false, no: !prev[row].no };
      }
      return next;
    });
  };

  return (
    <div className="card-stack__card card-stack__card--form">
      <div className={`rsvp-ticket${submitting ? ' rsvp-ticket--submitting' : ''}`}>
        {submitting && (
          <div className="rsvp-ticket__loader-dots">
            <span />
            <span />
            <span />
          </div>
        )}
        <header className="rsvp-ticket__header">
          <span className="rsvp-ticket__header-left">20</span>
          <span className="rsvp-ticket__header-right">26</span>
          <div className="rsvp-ticket__header-center">092026</div>
        </header>

        <div className="rsvp-ticket__lines">
          <hr /><hr /><hr />
        </div>

        <h1 className="rsvp-ticket__title">RSVP</h1>
        <p className="rsvp-ticket__subtitle">For the Ceremony &amp; Reception</p>

        <div className="rsvp-ticket__date-row">
          <span className="rsvp-ticket__date-label">on the date:</span>
          <span className="rsvp-ticket__date-value"><span>September 20, 2026</span></span>
        </div>

        <table className="rsvp-ticket__table">
          <thead>
            <tr>
              <td className="rsvp-ticket__col-name">Names:</td>
              <td className="rsvp-ticket__col-attend">Yes</td>
              <td className="rsvp-ticket__col-attend">No</td>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: GUEST_ROWS }, (_, i) => (
              <tr key={i}>
                <td className="rsvp-ticket__td-name">
                  <input
                    type="text"
                    value={names[i]}
                    onChange={(e) => handleName(i, e.target.value)}
                  />
                </td>
                <td className="rsvp-ticket__td-check rsvp-ticket__td-check--yes" onClick={() => handleCheck(i, 'yes')}>
                  <input
                    type="checkbox"
                    id={`attend-yes-${i}`}
                    checked={checks[i].yes}
                    readOnly
                  />
                  <label htmlFor={`attend-yes-${i}`} onClick={(e) => e.preventDefault()} />
                </td>
                <td className="rsvp-ticket__td-check rsvp-ticket__td-check--no" onClick={() => handleCheck(i, 'no')}>
                  <input
                    type="checkbox"
                    id={`attend-no-${i}`}
                    checked={checks[i].no}
                    readOnly
                  />
                  <label htmlFor={`attend-no-${i}`} onClick={(e) => e.preventDefault()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="rsvp-ticket__table">
          <thead>
            <tr>
              <td className="rsvp-ticket__col-name">Dietary Restrictions:</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="rsvp-ticket__td-name">
                <input type="text" value={dietary} onChange={(e) => setDietary(e.target.value)} />
              </td>
            </tr>
          </tbody>
        </table>

        <table className="rsvp-ticket__table">
          <thead>
            <tr>
              <td className="rsvp-ticket__col-name">Messages / Comments:</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="rsvp-ticket__td-name">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Envelope({ closing, done, children }) {
  const cls = done ? ' envelope-wrapper--done' : closing ? ' envelope-wrapper--closing' : '';
  return (
    <div className={`envelope-wrapper${cls}`}>
      <div className="envelope__back" />
      <div className="envelope__card-slot">{children}</div>
      <div className="envelope__front" />
      <div className="envelope__opener" />
      {(closing || done) && <p className="rsvp-success"><WaveText text="Thank you! Your RSVP has been sent." startAnimationDelay={done ? 500 : 2200} /></p>}
    </div>
  );
}

export default function RSVPOverlay({ isOpen, onClose, onCloseStart, closeDelay }) {
  const dispatch = useDispatch();
  const [accepted, setAccepted] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const dataRef = useRef({});

  // Mark animations done after close sequence completes
  useEffect(() => {
    if (!accepted || animDone) return;
    const timer = setTimeout(() => setAnimDone(true), 2000);
    return () => clearTimeout(timer);
  }, [accepted, animDone]);

  const validate = useCallback(() => {
    const data = dataRef.current;
    const filledGuests = [];
    for (let i = 1; i <= GUEST_ROWS; i++) {
      const name = data[`guest_${i}`];
      const rsvp = data[`rsvp_${i}`];
      if (name) filledGuests.push({ i, name, rsvp });
    }
    if (filledGuests.length === 0) {
      return 'Please enter at least one guest name.';
    }
    const missing = filledGuests.some(g => g.rsvp !== 'yes' && g.rsvp !== 'no');
    if (missing) {
      return 'Please select attending or not for each guest.';
    }
    return null;
  }, []);

  // Submit immediately on click, reading from dataRef (always in sync)
  const handleSubmit = useCallback(async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitRSVP(dataRef.current);
      dispatch(setRsvpStatus('accepted'));
    } catch {
      setError('Something went wrong! Please try again.');
    } finally {
      setSubmitting(false);
    }
    return true;
  }, [dispatch, validate]);

  const handleAccept = useCallback((card) => {
    if (card.type !== 'form') return;
  }, []);

  const handleReject = useCallback((card) => {
    if (card.type !== 'form') return;
  }, []);

  const renderCard = useCallback((card) => {
    if (card.type === 'form') {
      return <RSVPForm dataRef={dataRef} submitting={submitting} />;
    }
    return null;
  }, [submitting]);

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
          <Envelope closing={accepted && !animDone} done={animDone}>
            {stack?.element}
          </Envelope>
        </div>
        {!accepted && (
          <div className="rsvp-content__actions">
            <button
              className="rsvp-btn rsvp-btn--accept"
              onClick={async () => { const ok = await handleSubmit(); if (ok) { setAccepted(true); stack?.accept(); } }}
              disabled={stack?.isAnimating || submitting}
              aria-label="Accept RSVP"
            >
              {submitting ? '…' : (
                <>
                  Send
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </>
              )}
            </button>
            {error && <p className="rsvp-error">{error}</p>}
          </div>
        )}
      </div>
    </Modal>
  );
}

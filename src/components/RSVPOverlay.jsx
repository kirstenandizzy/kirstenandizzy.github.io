import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setRsvpStatus } from '../store/weddingSlice';
import submitRSVP from '../utils/submitRSVP';
import WaveText from './WaveText';
import RSVPShip from './RSVPShip';
import '../styles/RSVPForm.scss';

const MAX_GUESTS = 20;

export default function RSVPOverlay({ isOpen, onClose, onCloseStart }) {
  const dispatch = useDispatch();
  const [guests, setGuests] = useState([{ name: '', attending: null }]);
  const [dietary, setDietary] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const updateGuest = (index, field, value) => {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };

  const addGuest = () => {
    if (guests.length < MAX_GUESTS) {
      const lastAttending = guests[guests.length - 1].attending;
      setGuests(prev => [...prev, { name: '', attending: lastAttending }]);
    }
  };

  const removeGuest = (index) => {
    if (guests.length > 1) {
      setGuests(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validate = useCallback(() => {
    const filled = guests.filter(g => g.name.trim());
    if (filled.length === 0) return 'Please enter at least one guest name.';
    const missing = filled.some(g => g.attending === null);
    if (missing) return 'Please select attending or not for each guest.';
    return null;
  }, [guests]);

  const handleSubmit = useCallback(async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError(null);
    try {
      const formData = {};
      guests.forEach((g, i) => {
        formData[`guest_${i + 1}`] = g.name.trim();
        formData[`rsvp_${i + 1}`] = g.attending === true ? 'yes' : g.attending === false ? 'no' : '';
      });
      formData.dietary = dietary.trim();
      formData.message = comments.trim();
      await submitRSVP(formData);
      dispatch(setRsvpStatus('accepted'));
      setSubmitted(true);
    } catch {
      setError('Something went wrong! Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [guests, validate, dispatch]);

  const handleClose = () => {
    if (onCloseStart) onCloseStart();
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <RSVPShip isOpen={isOpen} />
      <div className="rsvp-overlay" onClick={handleClose}>
        <div className="rsvp-overlay__card" onClick={e => e.stopPropagation()}>
          <button className="rsvp-overlay__close" onClick={handleClose} aria-label="Close">
            &times;
          </button>

          {submitted ? (() => {
            const filled = guests.filter(g => g.name.trim());
            const allYes = filled.every(g => g.attending === true);
            const allNo = filled.every(g => g.attending === false);
            const subtitle = allYes
              ? "We're so excited to celebrate with you!"
              : allNo
              ? "We're sorry you can't make it, just let us know if there is a change in plans!"
              : "We're so excited to celebrate with you \u2014 we know not everyone in your group can make it, let us know if there are any changes!";
            return (
              <div className="rsvp-overlay__success">
                <WaveText text="Thank you! RSVP sent." />
                <p className="rsvp-overlay__success-sub">{subtitle}</p>
              </div>
            );
          })() : (
            <>
              <h2 className="rsvp-overlay__title">RSVP</h2>
              <p className="rsvp-overlay__subtitle">September 20, 2026, 5:30 PM</p>
              <p className="rsvp-overlay__subtitle">Windows on the Water<br />Sea Bright, NJ 07760</p>

              <p className="rsvp-overlay__hint">Plus ones welcome</p>
              <div className="rsvp-overlay__guests">
                {guests.map((guest, i) => (
                  <div className="rsvp-row" key={i}>
                    <input
                      className="rsvp-row__name"
                      type="text"
                      placeholder="Guest name"
                      value={guest.name}
                      onChange={e => updateGuest(i, 'name', e.target.value)}
                      disabled={submitting}
                    />
                    <div className="rsvp-row__radios">
                      <label className={`rsvp-row__radio rsvp-row__radio--yes${guest.attending === true ? ' rsvp-row__radio--selected' : ''}`}>
                        <input
                          type="radio"
                          name={`attending-${i}`}
                          checked={guest.attending === true}
                          onChange={() => updateGuest(i, 'attending', true)}
                          disabled={submitting}
                        />
                        Yes
                      </label>
                      <label className={`rsvp-row__radio rsvp-row__radio--no${guest.attending === false ? ' rsvp-row__radio--selected' : ''}`}>
                        <input
                          type="radio"
                          name={`attending-${i}`}
                          checked={guest.attending === false}
                          onChange={() => updateGuest(i, 'attending', false)}
                          disabled={submitting}
                        />
                        No
                      </label>
                    </div>
                    {guests.length > 1 && (
                      <button
                        className="rsvp-row__remove"
                        onClick={() => removeGuest(i)}
                        disabled={submitting}
                        aria-label="Remove guest"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {guests.length < MAX_GUESTS && (
                <button className="rsvp-overlay__add" onClick={addGuest} disabled={submitting}>
                  + Add Guest
                </button>
              )}

              <div className="rsvp-overlay__extras">
                <input
                  className="rsvp-overlay__field"
                  type="text"
                  placeholder="Dietary restrictions"
                  value={dietary}
                  onChange={e => setDietary(e.target.value)}
                  disabled={submitting}
                />
                <textarea
                  className="rsvp-overlay__field rsvp-overlay__field--multiline"
                  placeholder="Comments or messages"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  disabled={submitting}
                  rows={3}
                />
              </div>

              {error && <p className="rsvp-overlay__error">{error}</p>}

              <button
                className="rsvp-overlay__submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="rsvp-overlay__dots">
                    <span /><span /><span />
                  </span>
                ) : 'Send RSVP'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

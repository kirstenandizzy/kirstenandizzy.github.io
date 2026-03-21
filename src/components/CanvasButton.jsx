import { useState, useRef, useCallback, useEffect } from 'react';
import PixelSprite from '../sprites/PixelSprite';
import { pipeSheet, ALLOWED_PIPE_COLORS } from '../sprites/sheets/pipes';

const PIPE_SCALE = 2;

function pickRandomColor(exclude) {
  const choices = ALLOWED_PIPE_COLORS.filter(c => c !== exclude);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function CanvasButton({ onClick }) {
  const [pipeState, setPipeState] = useState('hidden');
  const [pipeColor, setPipeColor] = useState('green');
  const [pipeLeft, setPipeLeft] = useState(0);
  const buttonRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!buttonRef.current || !wrapperRef.current) return;
    const btnRect = buttonRef.current.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    setPipeLeft(btnRect.left - wrapperRect.left + btnRect.width / 2);
  }, []);

  const handleWeddingPartyClick = useCallback((e) => {
    if (onClick) onClick(e);
    if (pipeState === 'rising' || pipeState === 'retracting') return;

    if (pipeState === 'hidden') {
      setPipeColor(pickRandomColor(pipeColor));
      setPipeState('rising');
    } else if (pipeState === 'visible') {
      setPipeState('retracting');
    }
  }, [pipeState, onClick]);

  const handleTransitionEnd = useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    if (pipeState === 'rising') {
      setPipeState('visible');
    } else if (pipeState === 'retracting') {
      setPipeState('hidden');
    }
  }, [pipeState]);

  const isUp = pipeState === 'rising' || pipeState === 'visible';
  const isActive = pipeState !== 'hidden';

  let slideClass = '';
  if (isActive) slideClass = isUp ? 'pipe-up' : 'pipe-down';

  return (
    <div className="canvas-button-wrapper" ref={wrapperRef}>
      <div className="pipe-clip" aria-hidden="true">
        <div
          className={`pipe-slide ${slideClass}`}
          style={{ left: pipeLeft }}
          onTransitionEnd={handleTransitionEnd}
        >
          <PixelSprite sheet={pipeSheet} name={`${pipeColor}-pipe`} scale={PIPE_SCALE} />
        </div>
      </div>

      <div className="canvas-button-container">
        <button onClick={onClick}>
          Bride & Groom
        </button>
        <button onClick={onClick}>
          RSVP
        </button>
        <button ref={buttonRef} onClick={handleWeddingPartyClick}>
          Wedding Party
        </button>
      </div>
    </div>
  );
}

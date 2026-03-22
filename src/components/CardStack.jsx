import { useState, useCallback } from 'react';

export function useCardStack({ cards, onAccept, onReject, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(null); // 'accept' | 'reject' | null

  const isAnimating = animatingOut !== null;
  const isDone = currentIndex >= cards.length;

  const handleAnimationEnd = useCallback(() => {
    const card = cards[currentIndex];
    if (animatingOut === 'accept') {
      onAccept?.(card);
    } else if (animatingOut === 'reject') {
      onReject?.(card);
    }
    const nextIndex = currentIndex + 1;
    setAnimatingOut(null);
    setCurrentIndex(nextIndex);
    if (nextIndex >= cards.length) {
      onComplete?.();
    }
  }, [animatingOut, currentIndex, cards, onAccept, onReject, onComplete]);

  const accept = useCallback(() => {
    if (isAnimating || isDone) return;
    setAnimatingOut('accept');
  }, [isAnimating, isDone]);

  const reject = useCallback(() => {
    if (isAnimating || isDone) return;
    setAnimatingOut('reject');
  }, [isAnimating, isDone]);

  return { currentIndex, animatingOut, isAnimating, isDone, accept, reject, handleAnimationEnd };
}

export default function CardStack({ cards, renderCard, onAccept, onReject, onComplete }) {
  const { currentIndex, animatingOut, isAnimating, isDone, accept, reject, handleAnimationEnd } =
    useCardStack({ cards, onAccept, onReject, onComplete });

  if (isDone) return { isAnimating, isDone, accept, reject, element: null };

  const visibleCards = cards.slice(currentIndex, currentIndex + 2);

  return {
    isAnimating,
    isDone,
    accept,
    reject,
    element: (
      <div className="card-stack">
        {visibleCards.map((card, i) => {
          const isTop = i === 0;
          let className = 'card-stack__item';
          if (isTop && animatingOut === 'accept') className += ' card-stack__item--accept';
          if (isTop && animatingOut === 'reject') className += ' card-stack__item--reject';

          return (
            <div
              key={card.id}
              className={className}
              style={{
                zIndex: visibleCards.length - i,
                transform: isTop ? undefined : `translate3d(0, 0, ${-50 * i}px)`,
              }}
              // onAnimationEnd={isTop && animatingOut ? handleAnimationEnd : undefined}
            >
              {renderCard(card)}
            </div>
          );
        })}
      </div>
    ),
  };
}

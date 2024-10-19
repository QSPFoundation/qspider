import { PauseIcon } from '@radix-ui/react-icons';
import { openPauseScreen } from '@qspider/game-state';
import { useLocalStorage, useEvent } from 'react-use';
import { useCallback, TouchEvent, useState } from 'react';

export const TouchPauseButton: React.FC = () => {
  const [value, setValue] = useLocalStorage('qspider-pause-button-offset', 0);
  const [isDragging, setIsDragging] = useState(false);
  const [startTouch, setStartTouch] = useState(0);

  function onTouchStart(e: TouchEvent) {
    setStartTouch(e.touches[0].clientX - (value || 0));
    setIsDragging(true);
  }
  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      setValue(e.touches[0].clientX - startTouch);
    },
    [isDragging, setValue, startTouch],
  );
  useEvent('touchmove', onTouchMove);
  const onTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
  }, [isDragging]);
  useEvent('touchend', onTouchEnd);

  return (
    <div className="qsp-touch-pause-button">
      <button
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onClick={openPauseScreen}
        style={{ transform: `translateX(${value}px)` }}
      >
        <PauseIcon />
      </button>
    </div>
  );
};

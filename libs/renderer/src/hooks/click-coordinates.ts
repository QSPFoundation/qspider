import { useState, useCallback } from 'react';
import { useEventListener } from './event-listener';

type Coordinates = { x: number; y: number };

export function useClickCoordinates(): Coordinates {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handler = useCallback(
    ({ clientX, clientY }: MouseEvent) => {
      // Update coordinates
      setCoords({ x: clientX, y: clientY });
    },
    [setCoords]
  );

  // Add event listener using our hook
  useEventListener('mouseup', handler);
  useEventListener('touchend', handler);

  return coords;
}

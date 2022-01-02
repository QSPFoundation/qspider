import { useRef, useEffect } from 'react';

export function useEventListener<E extends Event>(
  eventName: string,
  handler: (e: E) => void,
  element: HTMLElement | Window | Document = window
): void {
  const savedHandler = useRef<(e: E) => void>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = (event: Event): void => {
        if (savedHandler.current) savedHandler.current(event as E);
      };

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return (): void => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
}

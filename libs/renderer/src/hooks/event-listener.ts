import { useRef, useEffect } from 'react';

export function useEventListener<E extends Event>(
  eventName: string,
  handler: (e: E) => void,
  element: HTMLElement | Window | Document = window,
  options?: AddEventListenerOptions
): void {
  const savedHandler = useRef<(e: E) => void>();
  const { capture, passive, once } = options || {};

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
      const opts = { capture, passive, once };
      // Add event listener
      element.addEventListener(eventName, eventListener, opts);

      // Remove event listener on cleanup
      return (): void => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element, capture, passive, once] // Re-run if eventName or element changes
  );
}

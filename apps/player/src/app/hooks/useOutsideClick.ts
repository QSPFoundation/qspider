import { useRef, useCallback, useEffect, MutableRefObject } from 'react';

export function useOutsideClick(onOutsideClick: () => void): MutableRefObject<HTMLDivElement> {
  const node = useRef<HTMLDivElement>();

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!node.current) return;
      if (node.current.contains(e.target as Node)) {
        // inside click
        return;
      }
      // outside click
      onOutsideClick();
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    },
    [onOutsideClick]
  );

  useEffect(() => {
    // add when mounted
    document.addEventListener('mousedown', handleClick, { capture: false });
    // return function to be called when unmounted
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick]);

  return node;
}

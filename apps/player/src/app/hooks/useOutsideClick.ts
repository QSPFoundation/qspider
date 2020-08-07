import { useRef, useCallback, useEffect, MutableRefObject } from 'react';

export function useOutsideClick(onOutsideClick: () => void): MutableRefObject<HTMLDivElement> {
  const node = useRef<HTMLDivElement>();

  const handleClick = useCallback(
    (e) => {
      if (!node.current) return;
      if (node.current.contains(e.target)) {
        // inside click
        return;
      }
      // outside click
      onOutsideClick();
    },
    [onOutsideClick]
  );

  useEffect(() => {
    // add when mounted
    document.addEventListener('mousedown', handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick]);

  return node;
}

import { useRef, useCallback, useEffect } from 'react';

export function useOutsideClick(onOutsideClick: () => void) {
  const node = useRef<HTMLDivElement>();

  const handleClick = useCallback((e) => {
    if (!node.current) return;
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    console.log('outside click');
    // outside click
    onOutsideClick();
  }, []);

  useEffect(() => {
    // add when mounted
    document.addEventListener('mousedown', handleClick);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return node;
}

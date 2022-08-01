import { useEffect, useRef } from 'react';

type Optional<T> = T | undefined;

export function usePrevious<T>(value: T): Optional<T> {
  const ref = useRef<Optional<T>>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

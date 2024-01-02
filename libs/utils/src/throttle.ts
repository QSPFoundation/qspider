// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThrottledFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => ReturnType<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): ThrottledFunction<T> {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function (this: unknown, ...args): ReturnType<T> {
    if (!inThrottle) {
      inThrottle = true;

      setTimeout(() => (inThrottle = false), limit);

      lastResult = func.apply(this, args) as ReturnType<T>;
    }

    return lastResult;
  };
}

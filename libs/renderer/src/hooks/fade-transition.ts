import { TransitionFn, useTransition } from '@react-spring/web';

export function useFadeTransition(state: boolean): TransitionFn {
  return useTransition(state, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  }) as unknown as TransitionFn;
}

import { TransitionFn, useTransition } from '@react-spring/web';

export function useFadeTransition(state: boolean): TransitionFn {
  return useTransition(state, {
    from: { opacity: 0, transform: 'translate(0, -2%) scale(0.96)' },
    enter: { opacity: 1, transform: 'translate(0, 0) scale(1)' },
    leave: { opacity: 0, transform: 'translate(0, -2%) scale(0.96)' },
  }) as unknown as TransitionFn;
}

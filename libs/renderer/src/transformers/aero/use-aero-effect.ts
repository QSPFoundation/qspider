import { useQspVariable } from '@qspider/game-state';
import { TransitionFn, useTransition } from '@react-spring/web';
import { AERO_EFFECTS } from './aero-effects';

export function useAeroEffect(state: boolean, effectVar: string, durationVar: string): TransitionFn {
  const effect = useQspVariable(effectVar, '', 0, '');
  const duration = useQspVariable(durationVar, '', 0, 500);
  return useTransition(state, {
    ...(AERO_EFFECTS[effect] ?? {}),
    config: {
      duration,
    },
  }) as unknown as TransitionFn;
}

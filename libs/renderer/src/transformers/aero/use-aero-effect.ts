import { useQspVariable } from '@qspider/game-state';
import { TransitionFn, useTransition } from '@react-spring/web';
import { AERO_EFFECTS } from './aero-effects';

export function useAeroEffect(state: boolean, effectVar: string, durationVar: string): TransitionFn {
  const effect = useQspVariable(effectVar, '', 0, '');
  let duration = useQspVariable(durationVar, '', 0, 500);
  const effectConfig = AERO_EFFECTS[effect] ?? {};
  if (effectConfig.enter && Array.isArray(effectConfig.enter)) {
    duration /= effectConfig.enter.length;
  }
  return useTransition(state, {
    ...effectConfig,
    config: {
      duration,
    },
  }) as unknown as TransitionFn;
}

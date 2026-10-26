import { useQspVariable } from '@qspider/game-state';
import { TransitionFn, useTransition } from '@react-spring/web';
import { aeroEffectConfig, aeroStepDuration } from './aero-effect-timing';

export function useAeroEffect(state: boolean, effectVar: string, durationVar: string): TransitionFn {
  const effect = useQspVariable(effectVar, '', 0, '');
  const totalDuration = useQspVariable(durationVar, '', 0, 500);
  const effectConfig = aeroEffectConfig(effect);
  const duration = aeroStepDuration(totalDuration, effectConfig);
  return useTransition(state, {
    ...effectConfig,
    config: {
      duration,
    },
  }) as unknown as TransitionFn;
}

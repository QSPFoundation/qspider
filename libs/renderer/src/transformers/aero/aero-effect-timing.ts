import type { UseTransitionProps } from '@react-spring/web';
import { AERO_EFFECTS } from './aero-effects';

/** The transition config for an effect name; unknown or empty names give no effect. */
export function aeroEffectConfig(effect: string): UseTransitionProps {
  return AERO_EFFECTS[effect] ?? {};
}

/** The duration of each step: an effect with several `enter` steps splits the total time between them. */
export function aeroStepDuration(duration: number, effectConfig: UseTransitionProps): number {
  if (effectConfig.enter && Array.isArray(effectConfig.enter)) {
    return duration / effectConfig.enter.length;
  }
  return duration;
}

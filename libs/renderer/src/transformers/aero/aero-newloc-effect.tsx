import { newLocHash$, useQspVariable } from '@qspider/game-state';
import { AERO_EFFECTS } from './aero-effects';
import { useAtom } from '@xoid/react';
import { TransitionFn, animated, useTransition } from '@react-spring/web';
import { ReactNode } from 'react';

export const AeroNewlocEffect: React.FC<{ children: ReactNode }> = ({ children }) => {
  const effect = useQspVariable('$NEWLOC_EFFECT', '', 0, '');
  let duration = useQspVariable('NEWLOC_EFFECT_TIME', '', 0, 500);
  const isSequential = useQspVariable('NEWLOC_EFFECT_SEQ', '', 0, 0);
  const effectConfig = AERO_EFFECTS[effect] ?? {};
  if (effectConfig.enter && Array.isArray(effectConfig.enter)) {
    duration /= effectConfig.enter.length;
  }
  const newLocHash = useAtom(newLocHash$);

  const transformation = useTransition(newLocHash, {
    ...effectConfig,
    key: newLocHash,
    exitBeforeEnter: Boolean(isSequential),
    config: {
      duration,
    },
  }) as unknown as TransitionFn;

  return transformation((style, item) => (
    <animated.div key={item} style={style}>
      {children}
    </animated.div>
  ));
};

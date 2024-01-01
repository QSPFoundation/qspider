import { mainContent$, newLocHash$, nextMainContent$, useQspVariable } from '@qspider/game-state';
import { AERO_EFFECTS } from './aero-effects';
import { useAtom } from '@xoid/react';
import { TransitionFn, animated, useTransition } from '@react-spring/web';
import { ReactNode, useEffect } from 'react';

export const AeroNewlocEffect: React.FC<{ children: ReactNode }> = ({ children }) => {
  const effect = useQspVariable('$NEWLOC_EFFECT', '', 0, '');
  let duration = useQspVariable('NEWLOC_EFFECT_TIME', '', 0, 500);
  const isSequential = Boolean(useQspVariable('NEWLOC_EFFECT_SEQ', '', 0, 0));
  const effectConfig = AERO_EFFECTS[effect] ?? {};
  if (effectConfig.enter && Array.isArray(effectConfig.enter)) {
    duration /= effectConfig.enter.length;
  }
  const newLocHash = useAtom(newLocHash$);

  const transformation = useTransition(newLocHash, {
    ...effectConfig,
    key: newLocHash,
    exitBeforeEnter: isSequential,
    ...(isSequential
      ? {}
      : {
          leave: {
            ...effectConfig.leave,
            config: {
              duration: 0,
            },
          },
        }),
    config: {
      duration,
    },
    onRest() {
      mainContent$.set(nextMainContent$.value);
    },
  }) as unknown as TransitionFn;

  useEffect(() => {
    if (!effect || !isSequential) {
      mainContent$.set(nextMainContent$.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect, newLocHash]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (!effect) return <>{children}</>;

  return transformation((style, item) => (
    <animated.div key={item} style={style}>
      {children}
    </animated.div>
  ));
};

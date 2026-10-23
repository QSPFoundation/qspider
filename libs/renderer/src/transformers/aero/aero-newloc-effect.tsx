import { mainContent$, newLocEffect$, newLocHash$, nextMainContent$ } from '@qspider/game-state';
import { AERO_EFFECTS } from './aero-effects';
import { useAtom } from '@xoid/react';
import { TransitionFn, animated, useTransition } from '@react-spring/web';
import { ReactNode, useEffect } from 'react';

export const AeroNewlocEffect: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { effect, time, seq: isSequential } = useAtom(newLocEffect$);
  let duration = time;
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
  }, [effect, isSequential, newLocHash]);

  if (!effect) return children;

  return transformation((style, item) => (
    <animated.div key={item} data-qsp="newloc-effect" style={style}>
      {children}
    </animated.div>
  ));
};

import { newLocHash$, useQspVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import React from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

import './effect.css';

export const AeroEffect: React.FC<{
  durationVar: string;
  effectVar: string;
  sequenceVar?: string;
  animationKey?: string;
  children: React.ReactNode;
}> = ({ durationVar, effectVar, sequenceVar, animationKey, children }) => {
  const effect = useQspVariable(effectVar, '', 0, '');
  const duration = useQspVariable(durationVar, '', 0, 500);
  const sequence = useQspVariable(sequenceVar, '', 0, 0);
  const newLocationHash = useAtom(newLocHash$);
  if (animationKey === '@@location@@') {
    animationKey = newLocationHash;
  }
  if (!effect) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }
  if (sequence) {
    return (
      <SwitchTransition>
        <CSSTransition
          key={animationKey}
          in={true}
          timeout={duration}
          classNames={effect}
          mountOnEnter
          unmountOnExit
          appear
          style={{ '--effect-duration': duration + 'ms' } as React.CSSProperties}
        >
          {children}
        </CSSTransition>
      </SwitchTransition>
    );
  }
  return (
    <CSSTransition
      in={true}
      key={animationKey}
      timeout={duration}
      classNames={effect}
      mountOnEnter
      unmountOnExit
      appear
      style={{ '--effect-duration': duration + 'ms' } as React.CSSProperties}
    >
      {children}
    </CSSTransition>
  );
};

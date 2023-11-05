import { newLocHash$, useQspVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import React, { forwardRef, useRef } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

import './effect.css';

export const AeroEffect: React.FC<{
  durationVar: string;
  effectVar: string;
  sequenceVar?: string;
  animationKey?: string;
  children: React.ReactNode;
}> = forwardRef(({ durationVar, effectVar, sequenceVar, animationKey, children }, ref) => {
  const effect = useQspVariable(effectVar, '', 0, '');
  const duration = useQspVariable(durationVar, '', 0, 500);
  const sequence = useQspVariable(sequenceVar, '', 0, 0);
  const newLocationHash = useAtom(newLocHash$);
  const nodeRef = useRef(null);
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
          nodeRef={nodeRef}
          in={true}
          timeout={duration}
          classNames={effect}
          mountOnEnter
          unmountOnExit
          appear
          style={{ '--effect-duration': duration + 'ms' } as React.CSSProperties}
        >
          <div ref={nodeRef} data-type="effect">
            {children}
          </div>
        </CSSTransition>
      </SwitchTransition>
    );
  }
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={true}
      key={animationKey}
      timeout={duration}
      classNames={effect}
      mountOnEnter
      unmountOnExit
      appear
      style={{ '--effect-duration': duration + 'ms' } as React.CSSProperties}
    >
      <div ref={nodeRef} data-type="effect">
        {children}
      </div>
    </CSSTransition>
  );
});

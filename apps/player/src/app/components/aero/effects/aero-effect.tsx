import { AeroEffectType } from '@qspider/qsp-wasm';
import React from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

import './effect.css';

export const AeroEffect: React.FC<{
  show: boolean;
  duration: number;
  effect: AeroEffectType;
  sequence?: boolean;
  animationKey?: string;
  onEffectEnd?: () => void;
}> = ({ show, duration, effect, onEffectEnd, sequence, animationKey, children }) => {
  if (!effect) {
    return show ? <>{children}</> : null;
  }
  if (sequence) {
    return (
      <SwitchTransition>
        <CSSTransition
          key={animationKey}
          in={show}
          timeout={duration}
          classNames={effect}
          mountOnEnter
          unmountOnExit
          appear
          onEntered={onEffectEnd}
          style={{ '--effect-duration': duration + 'ms' } as React.CSSProperties}
        >
          {children}
        </CSSTransition>
      </SwitchTransition>
    );
  }
  return (
    <CSSTransition
      in={show}
      key={animationKey}
      timeout={duration}
      classNames={effect}
      mountOnEnter
      unmountOnExit
      appear
      onEntered={onEffectEnd}
      style={{ '--effect-duration': duration + 'ms' } as React.CSSProperties}
    >
      {children}
    </CSSTransition>
  );
};

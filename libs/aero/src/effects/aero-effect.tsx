import React from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { AeroEffectType } from '../aero.types';

import './effect.css';

export const AeroEffect: React.FC<{
  show: boolean;
  duration: number;
  effect: AeroEffectType;
  sequence?: boolean;
  animationKey?: string;
  children: React.ReactNode;
  onEffectEnd?: () => void;
}> = ({ show, duration, effect, onEffectEnd, sequence, animationKey, children }) => {
  if (!effect) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
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

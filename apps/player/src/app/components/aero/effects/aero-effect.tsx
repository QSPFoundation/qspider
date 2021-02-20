import { AeroEffectType } from '@qspider/qsp-wasm';
import React from 'react';
import { CSSTransition } from 'react-transition-group';

import './effect.css';

export const AeroEffect: React.FC<{ show: boolean; duration: number; effect: AeroEffectType }> = ({
  show,
  duration,
  effect,
  children,
}) => {
  if (!effect) {
    return show ? <>{children}</> : null;
  }
  return (
    <CSSTransition
      in={show}
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

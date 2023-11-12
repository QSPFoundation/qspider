import { Attributes, useQspVariable, viewPath$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { animated } from '@react-spring/web';
import { useAttributes } from '../../content/attributes';
import { useAeroEffect } from './use-aero-effect';

export const AeroQspView: React.FC<{ attrs: Attributes; modal?: boolean; children: ReactNode }> = ({
  attrs,
  children,
}) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-view');
  const path = useAtom(viewPath$);
  const alwaysShow = useQspVariable('ALWAYS_SHOW_VIEW', '', 0, 0);
  const transitions = useAeroEffect(Boolean(path), '$VIEW_EFFECT', 'VIEW_EFFECT_TIME');
  const preparedStyle = {
    ...style,
    '--view-image': `url("${path}")`,
  };
  const onClick = (): void => {
    if (!alwaysShow) {
      viewPath$.set('');
    }
  };
  return transitions((styles, open) =>
    open ? (
      <animated.div style={styles}>
        <Tag {...attributes} style={preparedStyle} onClick={onClick}>
          {children}
        </Tag>
      </animated.div>
    ) : null
  );
};

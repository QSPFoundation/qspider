import { Attributes, useQspVariable, view$ } from '@qspider/game-state';
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
  const view = useAtom(view$);
  const alwaysShow = useQspVariable('ALWAYS_SHOW_VIEW', '', 0, 0);
  const transitions = useAeroEffect(view.isOpen, '$VIEW_EFFECT', 'VIEW_EFFECT_TIME');
  const preparedStyle = {
    ...style,
    '--view-image': `url("${view.path}")`,
  };
  const onClick = (): void => {
    if (!alwaysShow) {
      view$.actions.close();
    }
  };
  return transitions((styles, open) =>
    open ? (
      <animated.div style={styles}>
        <Tag {...attributes} style={preparedStyle} onClick={onClick}>
          {children}
        </Tag>
      </animated.div>
    ) : null,
  );
};

import { Attributes, getResource, useQspVariable, viewPath$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';

export const AeroQspView: React.FC<{ attrs: Attributes; modal?: boolean; children: ReactNode }> = ({
  attrs,
  children,
}) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-view');
  const path = useAtom(viewPath$);
  const alwaysShow = useQspVariable('ALWAYS_SHOW_VIEW', '', 0, 0);
  if (!path) return null;
  const preparedStyle = {
    ...style,
    '--view-image': `url("${getResource(path).url}")`,
  };
  const onClick = (): void => {
    if (!alwaysShow) {
      viewPath$.set('');
    }
  };
  return (
    <Tag {...attributes} style={preparedStyle} onClick={onClick}>
      {children}
    </Tag>
  );
};

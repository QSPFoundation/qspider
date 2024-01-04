import { Attributes, requestedAction$ } from '@qspider/game-state';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';
import { useAtom } from '@xoid/react';

export const QspPauseScreenContent: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen-content');
  const requestedSaveAction = useAtom(requestedAction$);
  return (
    <Tag style={style} {...attributes} data-requested-save-command={requestedSaveAction}>
      {children}
    </Tag>
  );
};

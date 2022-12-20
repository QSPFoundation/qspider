import { Attributes } from '@qspider/game-state';
import * as Tabs from '@radix-ui/react-tabs';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';

export const QspPauseScreenCredits: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen-credits');
  return (
    <Tabs.Content value="credits">
      <Tag style={style} {...attributes}>
        {children}
      </Tag>
    </Tabs.Content>
  );
};

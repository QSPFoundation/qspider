import { Attributes, currentGame$ } from '@qspider/game-state';
import * as Tabs from '@radix-ui/react-tabs';
import { useAtom } from '@xoid/react';
import React from 'react';
import { ReactNode } from 'react';
import { ContentRenderer } from '../../content-renderer';
import { useAttributes } from '../../content/attributes';

export const QspPauseScreenCredits: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen-credits');
  const currentGame = useAtom(currentGame$);
  const description = currentGame?.description ?? 'No description';
  return (
    <Tabs.Content value="credits">
      <Tag style={style} {...attributes}>
        {React.Children.count(children) > 0 ? children : <ContentRenderer content={description} />}
      </Tag>
    </Tabs.Content>
  );
};

import React from 'react';
import { Markup } from 'interweave';
import { observer } from 'mobx-react-lite';
import { transform } from './content/transformers';
import { useGameManager } from '@qspider/providers';
import { useQspVariable } from './hooks';

const blockList = ['script'];

export const Content: React.FC<{ content: string }> = observer(({ content }) => {
  const manager = useGameManager();
  const useHtml = useQspVariable('USEHTML', 1);
  if (useHtml || manager.currentGame?.mode === 'aero') {
    return (
      <Markup content={content} transform={transform} blockList={blockList} noWrap allowElements allowAttributes />
    );
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{content}</>;
});

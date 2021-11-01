import React from 'react';
import { Markup } from 'interweave';
import { observer } from 'mobx-react-lite';
import { useLayout } from '../../game/layout';
import { transform } from './transformers';

const blockList = ['script'];

export const Content: React.FC<{ content: string }> = observer(({ content }) => {
  const { useHtml } = useLayout();
  if (useHtml) {
    return (
      <Markup content={content} transform={transform} blockList={blockList} noWrap allowElements allowAttributes />
    );
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{content}</>;
});

import React from 'react';
import { Markup } from 'interweave';
import { observer } from 'mobx-react-lite';
import { useLayout } from '../../game/layout';
import { transform } from './transformers';

export const Content: React.FC<{ content: string }> = observer(
  ({ content }) => {
    const { useHtml } = useLayout();
    if (useHtml) {
      return <Markup content={content} transform={transform} noWrap />;
    }
    return <>{content}</>;
  }
);

import React from 'react';
import { Markup } from 'interweave';
import { observer } from 'mobx-react-lite';
import { useLayout } from '../../game/layout';
import { transform } from './transformers';

export const Content: React.FC<{ content: string }> = observer(
  ({ content }) => {
    const { useHtml } = useLayout();
    if (useHtml) {
      // this solves a problem in 1812 where link contain &gt without space and this is parsed wrong\
      // todo find a way to handle this in parser
      return (
        <Markup
          content={content.replace(/&gt /g, '& gt ')}
          transform={transform}
          noWrap
        />
      );
    }
    return <>{content}</>;
  }
);

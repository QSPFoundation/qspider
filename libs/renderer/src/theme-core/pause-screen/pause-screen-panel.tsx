import { Attributes, pauseScreenCurrentPanel$ } from '@qspider/game-state';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';
import { useAtom } from '@xoid/react';

export const QspPauseScreenPanel: React.FC<{ name: string; attrs: Attributes; children: ReactNode }> = ({
  name,
  attrs,
  children,
}) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen-panel');
  const currentPausePanel = useAtom(pauseScreenCurrentPanel$);
  const isVisible = currentPausePanel === name;
  if (!isVisible) return null;
  return (
    <Tag style={style} {...attributes}>
      {children}
    </Tag>
  );
};

import { ReactNode } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../content/attributes';

export const QspScrollable: React.FC<{
  scroll?: 'both' | 'horizontal' | 'vertical';
  attrs: Attributes;
  children: ReactNode;
}> = ({ children, attrs, scroll = 'both' }) => {
  const [, style, attributes] = useAttributes(attrs, 'div');
  return (
    <ScrollArea.Root style={style} {...attributes}>
      <ScrollArea.Viewport>{children}</ScrollArea.Viewport>
      {scroll === 'both' ? (
        <>
          <ScrollArea.Scrollbar orientation="horizontal">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </>
      ) : (
        <ScrollArea.Scrollbar orientation={scroll}>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      )}
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
};

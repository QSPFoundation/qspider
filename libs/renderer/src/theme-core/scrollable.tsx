import { ReactNode } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../content/attributes';

export const QspScrollable: React.FC<{
  scroll?: 'both' | 'horizontal' | 'vertical';
  attributes: Attributes;
  children: ReactNode;
}> = ({ children, attributes, scroll = 'both' }) => {
  const preparedAttributes = useAttributes(attributes);
  return (
    <ScrollArea.Root {...preparedAttributes}>
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

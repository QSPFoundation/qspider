import { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../content/attributes';
import { create } from 'xoid';
import { useAtom } from '@xoid/react';

export const noopScrollAtom$ = create(0);
export const scrollContext = createContext(noopScrollAtom$);

export const QspScrollable: React.FC<{
  scroll?: 'both' | 'horizontal' | 'vertical';
  attrs: Attributes;
  children: ReactNode;
}> = ({ children, attrs, scroll = 'both' }) => {
  const [, style, attributes] = useAttributes(attrs, 'div');
  const ref = useRef<HTMLDivElement>(null);
  const scrollTrigger = useAtom(useContext(scrollContext));
  useEffect(() => {
    if (ref.current && scrollTrigger) {
      ref.current.scrollTop = scrollTrigger > 0 ? ref.current.scrollHeight : 0;
    }
  }, [scrollTrigger]);

  return (
    <ScrollArea.Root style={style} {...attributes}>
      <ScrollArea.Viewport ref={ref}>{children}</ScrollArea.Viewport>
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

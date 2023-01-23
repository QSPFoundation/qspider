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
  const [, style, { className = '', ...attributes }] = useAttributes(attrs, 'div');
  const ref = useRef<HTMLDivElement>(null);
  const scrollTrigger = useAtom(useContext(scrollContext));
  useEffect(() => {
    if (ref.current && scrollTrigger) {
      ref.current.scrollTop = scrollTrigger > 0 ? ref.current.scrollHeight : 0;
    }
  }, [scrollTrigger]);

  return (
    <ScrollArea.Root style={style} {...attributes} className={className + ' qsp-scroll-root'}>
      <ScrollArea.Viewport ref={ref} className="qsp-scroll-area">
        {children}
      </ScrollArea.Viewport>
      {scroll === 'both' ? (
        <>
          <ScrollArea.Scrollbar className="qsp-scrollbar" orientation="horizontal">
            <ScrollArea.Thumb className="qsp-scrollbar-thumb" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar className="qsp-scrollbar" orientation="vertical">
            <ScrollArea.Thumb className="qsp-scrollbar-thumb" />
          </ScrollArea.Scrollbar>
        </>
      ) : (
        <ScrollArea.Scrollbar className="qsp-scrollbar" orientation={scroll}>
          <ScrollArea.Thumb className="qsp-scrollbar-thumb" />
        </ScrollArea.Scrollbar>
      )}
      <ScrollArea.Corner className="qsp-scrollbar-corner" />
    </ScrollArea.Root>
  );
};

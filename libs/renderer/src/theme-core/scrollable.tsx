import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../content/attributes';
import { create } from 'xoid';
import { useAtom, useSetup } from '@xoid/react';

export const noopScrollAtom$ = create(0);
export const scrollContext = createContext(noopScrollAtom$);
export type ScrollType = 'both' | 'horizontal' | 'vertical';
export const isScrollType = (t: unknown): t is ScrollType =>
  typeof t === 'string' && ['both', 'horizontal', 'vertical'].includes(t);

export const QspScrollable: React.FC<{
  scroll?: ScrollType;
  attrs: Attributes;
  children: ReactNode;
}> = ({ children, attrs, scroll = 'both' }) => {
  const [, style, { className = '', ...attributes }] = useAttributes(attrs, 'div', 'qsp-scrollable');
  const ref = useRef<HTMLDivElement>(null);
  const scrollTrigger = useAtom(useContext(scrollContext));

  const upScroll$ = useSetup(() => create(false));
  const upScroll = useAtom(upScroll$);
  const downScroll$ = useSetup(() => create(false));
  const downScroll = useAtom(downScroll$);

  useEffect(() => {
    if (ref.current && scrollTrigger) {
      ref.current.scrollTop = scrollTrigger > 0 ? ref.current.scrollHeight : 0;
    }
  }, [scrollTrigger]);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    function onScroll(): void {
      const hasUpScroll = ref.current ? ref.current.scrollTop > 0 : false;
      if (upScroll$.value !== hasUpScroll) {
        upScroll$.set(hasUpScroll);
      }
      const hasDownScroll = ref.current
        ? ref.current.offsetHeight + ref.current.scrollTop < ref.current.scrollHeight
        : true;
      if (hasDownScroll !== downScroll$.value) {
        downScroll$.set(hasDownScroll);
      }
    }
    onScroll();
    const interval = setInterval(onScroll, 300);
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      node.removeEventListener('scroll', onScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <ScrollArea.Root
      style={style}
      {...attributes}
      className={className + ' qsp-scroll-root'}
      data-upscroll={upScroll || undefined}
      data-downscroll={downScroll || undefined}
    >
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

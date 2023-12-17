import * as Dialog from '@radix-ui/react-dialog';

import { Attributes, currentGameEntry$, isPauseScreenVisible$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { useAttributes } from '../../content/attributes';
import { ReactNode } from 'react';
import { useFadeTransition } from '../../hooks/fade-transition';
import { animated } from '@react-spring/web';

export const QspPauseScreen: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const isVisible = useAtom(isPauseScreenVisible$);
  const currentGame = useAtom(currentGameEntry$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen');
  const transitions = useFadeTransition(isVisible);
  return (
    <Dialog.Root modal open={isVisible} onOpenChange={(isOpen): void => isPauseScreenVisible$.set(isOpen)}>
      {transitions((styles, item) => {
        return item ? (
          <Dialog.Portal container={document.getElementById('portal-container')}>
            <Dialog.Overlay className="qsp-overlay" />
            <Dialog.Content forceMount asChild>
              <animated.div className="qsp-dialog-container" style={styles}>
                <div className="qsp-pause-dialog">
                  <Dialog.Title>{currentGame?.title || 'Pause'}</Dialog.Title>
                  <Tag style={style} {...attributes}>
                    {children}
                  </Tag>
                </div>
              </animated.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null;
      })}
    </Dialog.Root>
  );
};

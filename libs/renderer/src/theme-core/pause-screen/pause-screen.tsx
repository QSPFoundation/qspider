import * as Dialog from '@radix-ui/react-dialog';

import { Attributes, currentGameEntry$, isPauseScreenVisible$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { useAttributes } from '../../content/attributes';
import { ReactNode } from 'react';

export const QspPauseScreen: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const isVisible = useAtom(isPauseScreenVisible$);
  const currentGame = useAtom(currentGameEntry$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen');
  return (
    <Dialog.Root modal open={isVisible} onOpenChange={(isOpen): void => isPauseScreenVisible$.set(isOpen)}>
      <Dialog.Portal container={document.getElementById('portal-container')}>
        <Dialog.Overlay className="qsp-overlay" />
        <Dialog.Content className="qsp-dialog-container">
          <div className="qsp-pause-dialog">
            <Dialog.Title>{currentGame?.title || 'Pause'}</Dialog.Title>
            <Tag style={style} {...attributes}>
              {children}
            </Tag>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

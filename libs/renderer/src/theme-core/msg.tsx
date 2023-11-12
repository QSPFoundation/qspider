import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, msg$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import { buttonContext } from './buttons';
import { QspScrollable } from './scrollable';

export const QspMsg: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-msg');
  const msg = useAtom(msg$);
  function onClose(): void {
    msg$.actions.close();
  }
  return (
    <buttonContext.Provider value={{ okAction: onClose, cancelAction: onClose }}>
      <Dialog.Root open={msg.isOpen} onOpenChange={onClose}>
        <Dialog.Portal container={document.getElementById('portal-container')}>
          <Dialog.Overlay className="qsp-overlay" />
          <Dialog.Content className="qsp-dialog-container">
            <Tag style={style} {...attributes}>
              {children}
            </Tag>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </buttonContext.Provider>
  );
};

export const QspMsgContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const msg = useAtom(msg$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-msg-content');
  return (
    <Dialog.Description asChild>
      <Tag style={style} {...attributes}>
        <QspScrollable attrs={{}}>
          <ContentRenderer content={msg.content} />
        </QspScrollable>
      </Tag>
    </Dialog.Description>
  );
};

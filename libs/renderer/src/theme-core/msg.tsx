import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, closeMsg, msg$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import { buttonContext } from './buttons';

export const QspMsg: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-msg');
  const msg = useAtom(msg$);
  if (!msg) return null;
  return (
    <buttonContext.Provider value={{ okAction: closeMsg, cancelAction: closeMsg }}>
      <Dialog.Root open={true} onOpenChange={(): void => closeMsg()}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
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
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-msg-content');
  if (!msg) return null;
  return (
    <Dialog.Description>
      <Tag style={style} {...attributes}>
        <ContentRenderer content={msg.text} />
      </Tag>
    </Dialog.Description>
  );
};

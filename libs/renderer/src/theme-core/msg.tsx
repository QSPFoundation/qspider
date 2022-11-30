import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, closeMsg, msg$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';
import { buttonContext } from './buttons';

export const QspMsg: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const preparedAttributes = useAttributes(attributes);
  const msg = useAtom(msg$);
  if (!msg) return null;
  return (
    <buttonContext.Provider value={{ okAction: closeMsg, cancelAction: closeMsg }}>
      <Dialog.Root open={true} onOpenChange={(): void => closeMsg()}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <qsp-msg {...preparedAttributes}>{children}</qsp-msg>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </buttonContext.Provider>
  );
};

export const QspMsgContent: React.FC = () => {
  const msg = useAtom(msg$);
  if (!msg) return null;
  return (
    <Dialog.Description>
      <ContentRenderer content={msg.text} />
    </Dialog.Description>
  );
};

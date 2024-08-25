import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, msg$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';
import { useFadeTransition } from '../hooks/fade-transition';
import { buttonContext } from './buttons';
import { QspScrollable } from './scrollable';
import { animated } from '@react-spring/web';
import { Markup } from '@qspider/html-renderer';
import { parsedMsgContent$ } from '../render-state';

export const QspMsg: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-msg');
  const msg = useAtom(msg$);
  const transitions = useFadeTransition(msg.isOpen);
  function onClose(): void {
    msg$.actions.close();
  }
  return (
    <buttonContext.Provider value={{ okAction: onClose, cancelAction: onClose }}>
      <Dialog.Root open={msg.isOpen} onOpenChange={onClose}>
        {transitions((styles, item) => {
          return item ? (
            <Dialog.Portal container={document.getElementById('portal-container')}>
              <Dialog.Overlay className="qsp-overlay" />
              <Dialog.Content forceMount asChild>
                <animated.div style={styles} className="qsp-dialog-container">
                  <Tag style={style} {...attributes}>
                    {children}
                  </Tag>
                </animated.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null;
        })}
      </Dialog.Root>
    </buttonContext.Provider>
  );
};

export const QspMsgContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { content, key } = useAtom(parsedMsgContent$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-msg-content');
  return (
    <Dialog.Description asChild>
      <Tag style={style} {...attributes} key={key}>
        <QspScrollable attrs={{}}>
          <Markup content={content} />
        </QspScrollable>
      </Tag>
    </Dialog.Description>
  );
};

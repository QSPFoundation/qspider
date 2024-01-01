import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, msg$, TEXT_PLACEHOLDER, useFormatVariable, useQspVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { CSSProperties, ReactNode } from 'react';
import { animated } from '@react-spring/web';
import { ContentRenderer } from '../../content-renderer';
import { useAttributes } from '../../content/attributes';
import { buttonContext } from '../../theme-core/buttons';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { QspScrollable } from '../../theme-core/scrollable';
import { useAeroEffect } from './use-aero-effect';
import { AeroOverlay } from './aero-overlay';

export const AeroQspMsg: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-msg');
  const msg = useAtom(msg$);
  const coordinates = useClickCoordinates();
  const msgX = useQspVariable('MSG_X', '', 0, 200);
  const msgY = useQspVariable('MSG_Y', '', 0, 165);
  const transitions = useAeroEffect(msg.isOpen, '$MSG_EFFECT', 'MSG_EFFECT_TIME');
  const useMouseCordinates = msgX < 0 || msgY < 0;
  const positionStyle = {
    '--aero-msg-x': `${useMouseCordinates ? coordinates.x : msgX}px`,
    '--aero-msg-y': `${useMouseCordinates ? coordinates.y : msgY}px`,
  } as CSSProperties;
  const contentClass = `qsp-dialog-container${useMouseCordinates ? ' at-mouse' : ''}`;
  function onClose(): void {
    msg$.actions.close();
  }
  return (
    <buttonContext.Provider value={{ okAction: onClose, cancelAction: onClose }}>
      <Dialog.Root open={msg.isOpen} onOpenChange={onClose}>
        {transitions((styles, item) => {
          return item ? (
            <Dialog.Portal forceMount container={document.getElementById('portal-container')}>
              <AeroOverlay />
              <Dialog.Content forceMount asChild style={positionStyle}>
                <animated.div style={styles} className={contentClass}>
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

export const AeroQspMsgContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const msg = useAtom(msg$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-msg-content');
  const format = useFormatVariable(useFormat);
  const toRender = format ? format.replace(TEXT_PLACEHOLDER, msg.content) : msg.content;
  return (
    <Tag style={style} {...attributes}>
      <QspScrollable attrs={{}}>
        <ContentRenderer content={toRender} />
      </QspScrollable>
    </Tag>
  );
};

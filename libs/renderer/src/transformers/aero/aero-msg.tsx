import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, closeMsg, msg$, TEXT_PLACEHOLDER, useFormatVariable, useQspVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { CSSProperties, ReactNode } from 'react';
import { ContentRenderer } from '../../content-renderer';
import { useAttributes } from '../../content/attributes';
import { buttonContext } from '../../theme-core/buttons';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { AeroEffect } from './aero-effect';
import { QspScrollable } from '../../theme-core/scrollable';

export const AeroQspMsg: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-msg');
  const msg = useAtom(msg$);
  const coordinates = useClickCoordinates();
  const isShadeDisabled = useQspVariable('DISABLESHADE', '', 0, 0);
  const msgX = useQspVariable('MSG_X', '', 0, 200);
  const msgY = useQspVariable('MSG_Y', '', 0, 165);
  if (!msg) return null;
  const useMouseCordinates = msgX < 0 || msgY < 0;
  const positionStyle = {
    '--aero-msg-x': `${useMouseCordinates ? coordinates.x : msgX}px`,
    '--aero-msg-y': `${useMouseCordinates ? coordinates.y : msgY}px`,
  } as CSSProperties;
  const contentClass = `qsp-dialog-container${useMouseCordinates ? ' at-mouse' : ''}`;
  return (
    <buttonContext.Provider value={{ okAction: closeMsg, cancelAction: closeMsg }}>
      <Dialog.Root open={true} onOpenChange={(): void => closeMsg()}>
        <Dialog.Portal container={document.getElementById('portal-container')}>
          {!isShadeDisabled && <Dialog.Overlay className="qsp-overlay" />}
          <AeroEffect effectVar="$MSG_EFFECT" durationVar="MSG_EFFECT_TIME">
            <Dialog.Content className={contentClass} style={positionStyle}>
              <Tag style={style} {...attributes}>
                {children}
              </Tag>
            </Dialog.Content>
          </AeroEffect>
        </Dialog.Portal>
      </Dialog.Root>
    </buttonContext.Provider>
  );
};

export const AeroQspMsgContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const msg = useAtom(msg$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-msg-content');
  const format = useFormatVariable(useFormat);
  if (!msg) return null;
  const toRender = format ? format.replace(TEXT_PLACEHOLDER, msg.text) : msg.text;
  return (
    <Dialog.Description asChild>
      <Tag style={style} {...attributes}>
        <QspScrollable attrs={{}}>
          <ContentRenderer content={toRender} />
        </QspScrollable>
      </Tag>
    </Dialog.Description>
  );
};

import * as Dialog from '@radix-ui/react-dialog';
import {
  Attributes,
  input$,
  inputResult$,
  submitInput,
  TEXT_PLACEHOLDER,
  useFormatVariable,
  useQspVariable,
} from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { CSSProperties, ReactNode } from 'react';
import { animated } from '@react-spring/web';
import { useAttributes } from '../../content/attributes';
import { ContentRenderer } from '../../content-renderer';
import { buttonContext } from '../../theme-core/buttons';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { QspScrollable } from '../../theme-core/scrollable';
import { useAeroEffect } from './use-aero-effect';

export const AeroQspInput: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const input = useAtom(input$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-input');
  const coordinates = useClickCoordinates();
  const isShadeDisabled = useQspVariable('DISABLESHADE', '', 0, 0);
  const inputX = useQspVariable('INPUT_X', '', 0, 200);
  const inputY = useQspVariable('INPUT_Y', '', 0, 165);
  const isOpen = Boolean(input);
  const transitions = useAeroEffect(isOpen, '$INPUT_EFFECT', 'INPUT_EFFECT_TIME');
  const useMouseCordinates = inputX < 0 || inputY < 0;
  const positionStyle = {
    '--aero-input-x': `${useMouseCordinates ? coordinates.x : inputX}px`,
    '--aero-input-y': `${useMouseCordinates ? coordinates.y : inputY}px`,
  } as CSSProperties;
  const contentClass = `qsp-dialog-container${useMouseCordinates ? ' at-mouse' : ''}`;
  return (
    <buttonContext.Provider
      value={{
        okAction: submitInput,
        cancelAction: (): void => {
          inputResult$.set('');
          submitInput();
        },
      }}
    >
      <Dialog.Root open={isOpen} onOpenChange={(): void => submitInput()}>
        {transitions((styles, open) =>
          open ? (
            <Dialog.Portal forceMount container={document.getElementById('portal-container')}>
              {!isShadeDisabled && (
                <Dialog.Overlay forceMount asChild>
                  <animated.div className="qsp-overlay" />
                </Dialog.Overlay>
              )}
              <Dialog.Content forceMount asChild style={positionStyle}>
                <animated.div style={styles} className={contentClass}>
                  <form
                    onSubmit={(e): void => {
                      e.preventDefault();
                      submitInput();
                    }}
                  >
                    <Tag style={style} {...attributes}>
                      {children}
                    </Tag>
                  </form>
                </animated.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null
        )}
      </Dialog.Root>
    </buttonContext.Provider>
  );
};

export const AeroQspInputContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const input = useAtom(input$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-input-content');
  const format = useFormatVariable(useFormat);
  if (!input) return null;
  const toRender = format ? format.replace(TEXT_PLACEHOLDER, input.text) : input.text;
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

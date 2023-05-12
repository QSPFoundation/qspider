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
import { useAttributes } from '../../content/attributes';
import { ContentRenderer } from '../../content-renderer';
import { buttonContext } from '../../theme-core/buttons';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { AeroEffect } from './aero-effect';

export const AeroQspInput: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const input = useAtom(input$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-input');
  const coordinates = useClickCoordinates();
  const isShadeDisabled = useQspVariable('DISABLESHADE', '', 0, 0);
  const inputX = useQspVariable('INPUT_X', '', 0, 200);
  const inputY = useQspVariable('INPUT_Y', '', 0, 165);
  if (!input) return null;
  const useMouseCordinates = inputX < 0 || inputY < 0;
  const positionStyle = {
    '--aero-input-x': `${useMouseCordinates ? coordinates.x : inputX}px`,
    '--aero-input-y': `${useMouseCordinates ? coordinates.y : inputY}px`,
  } as CSSProperties;
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
      <Dialog.Root open={true} onOpenChange={(): void => submitInput()}>
        <Dialog.Portal container={document.getElementById('portal-container')}>
          {!isShadeDisabled && <Dialog.Overlay className="qsp-overlay" />}
          <AeroEffect effectVar="$INPUT_EFFECT" durationVar="INPUT_EFFECT_TIME">
            <Dialog.Content className="qsp-dialog-container" style={positionStyle}>
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
            </Dialog.Content>
          </AeroEffect>
        </Dialog.Portal>
      </Dialog.Root>
    </buttonContext.Provider>
  );
};

export const AeroQspInputContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const input = useAtom(input$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-input-contnet');
  const format = useFormatVariable(useFormat);
  if (!input) return null;
  const toRender = format ? format.replace(TEXT_PLACEHOLDER, input.text) : input.text;
  return (
    <Dialog.Description asChild>
      <Tag style={style} {...attributes}>
        <ContentRenderer content={toRender} />
      </Tag>
    </Dialog.Description>
  );
};
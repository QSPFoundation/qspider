import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, input$, TEXT_PLACEHOLDER, useFormatVariable, useQspVariable } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { CSSProperties, ReactNode } from 'react';
import { animated } from '@react-spring/web';
import { useAttributes } from '../../content/attributes';
import { ContentRenderer } from '../../content-renderer';
import { buttonContext } from '../../theme-core/buttons';
import { useClickCoordinates } from '../../hooks/click-coordinates';
import { QspScrollable } from '../../theme-core/scrollable';
import { useAeroEffect } from './use-aero-effect';
import { AeroOverlay } from './aero-overlay';

export const AeroQspInput: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const input = useAtom(input$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-input');
  const coordinates = useClickCoordinates();
  const inputX = useQspVariable('INPUT_X', '', 0, 200);
  const inputY = useQspVariable('INPUT_Y', '', 0, 165);
  const transitions = useAeroEffect(input.isOpen, '$INPUT_EFFECT', 'INPUT_EFFECT_TIME');
  const useMouseCordinates = inputX < 0 || inputY < 0;
  const positionStyle = {
    '--aero-input-x': `${useMouseCordinates ? coordinates.x : inputX}px`,
    '--aero-input-y': `${useMouseCordinates ? coordinates.y : inputY}px`,
  } as CSSProperties;
  const contentClass = `qsp-dialog-container${useMouseCordinates ? ' at-mouse' : ''}`;
  return (
    <buttonContext.Provider
      value={{
        okAction: () => input$.actions.finish(),
        cancelAction: (): void => {
          input$.actions.close();
        },
      }}
    >
      <Dialog.Root open={input.isOpen} onOpenChange={(): void => input$.actions.close()}>
        {transitions((styles, open) =>
          open ? (
            <Dialog.Portal forceMount container={document.getElementById('portal-container')}>
              <AeroOverlay />
              <Dialog.Content forceMount asChild style={positionStyle}>
                <animated.div style={styles} className={contentClass}>
                  <form
                    onSubmit={(e): void => {
                      e.preventDefault();
                      input$.actions.finish();
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
  const toRender = format ? format.replace(TEXT_PLACEHOLDER, input.content) : input.content;
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

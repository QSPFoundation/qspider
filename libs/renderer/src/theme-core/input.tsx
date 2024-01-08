import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, input$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';
import { ContentRenderer } from '../content-renderer';
import { buttonContext } from './buttons';
import { QspScrollable } from './scrollable';
import { useFadeTransition } from '../hooks/fade-transition';
import { animated } from '@react-spring/web';

export const QspInput: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const input = useAtom(input$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-input');
  const transitions = useFadeTransition(input.isOpen);

  return (
    <buttonContext.Provider
      value={{
        okAction: (e) => {
          e.preventDefault();
          input$.actions.finish();
        },
        cancelAction: (e): void => {
          e.preventDefault();
          input$.actions.close();
        },
      }}
    >
      <Dialog.Root open={input.isOpen} onOpenChange={(): void => input$.actions.close()}>
        {transitions((styles, item) => {
          return item ? (
            <Dialog.Portal container={document.getElementById('portal-container')}>
              <Dialog.Overlay className="qsp-overlay" />
              <Dialog.Content forceMount asChild>
                <animated.div style={styles} className="qsp-dialog-container">
                  <Tag style={style} {...attributes}>
                    <form
                      onSubmit={(e): void => {
                        e.preventDefault();
                        input$.actions.finish();
                      }}
                    >
                      {children}
                    </form>
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

export const QspInputContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const input = useAtom(input$);
  const [Tag, style, { useFormat, ...attributes }] = useAttributes(attrs, 'qsp-input-content');
  return (
    <Dialog.Description asChild>
      <QspScrollable attrs={{}}>
        <Tag style={style} {...attributes}>
          <ContentRenderer content={input.content} />
        </Tag>
      </QspScrollable>
    </Dialog.Description>
  );
};

export const QspInputTag: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'input', 'qsp-input-tag');
  const input = useAtom(input$);
  const onInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    input$.actions.enter((e.target as HTMLInputElement).value);
  };
  return <input style={style} {...attributes} type="text" value={input.entered} onInput={onInput} autoFocus />;
};

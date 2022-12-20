import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, input$, inputResult$, submitInput } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';
import { ContentRenderer } from '../content-renderer';
import { buttonContext } from './buttons';

export const QspInput: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const input = useAtom(input$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-input');
  if (!input) return null;
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
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
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
        </Dialog.Portal>
      </Dialog.Root>
    </buttonContext.Provider>
  );
};

export const QspInputContent: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const input = useAtom(input$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-input-contnet');
  if (!input) return null;
  return (
    <Dialog.Description>
      <Tag style={style} {...attributes}>
        <ContentRenderer content={input.text} />
      </Tag>
    </Dialog.Description>
  );
};

export const QspInputTag: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const value = useAtom(inputResult$);
  const [, style, attributes] = useAttributes(attrs, 'input');
  const onInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    inputResult$.set((e.target as any).value);
  };
  return <input style={style} {...attributes} type="text" value={value} onInput={onInput} autoFocus />;
};

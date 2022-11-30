import * as Dialog from '@radix-ui/react-dialog';
import { Attributes, input$, inputResult$, submitInput } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';
import { ContentRenderer } from '../content-renderer';
import { buttonContext } from './buttons';

export const QspInput: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const input = useAtom(input$);
  const preparedAttributes = useAttributes(attributes);
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
              <qsp-input {...preparedAttributes}>{children}</qsp-input>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </buttonContext.Provider>
  );
};

export const QspInputContent: React.FC = () => {
  const input = useAtom(input$);
  if (!input) return null;
  return (
    <Dialog.Description>
      <ContentRenderer content={input.text} />
    </Dialog.Description>
  );
};

export const QspInputTag: React.FC<{ attributes: Attributes }> = ({ attributes }) => {
  const value = useAtom(inputResult$);
  const preparedAttributes = useAttributes(attributes);
  const onInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    inputResult$.set((e.target as any).value);
  };
  return <input {...preparedAttributes} type="text" value={value} onInput={onInput} autoFocus />;
};

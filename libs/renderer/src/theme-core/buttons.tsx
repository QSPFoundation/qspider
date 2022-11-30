import { Attributes } from '@qspider/game-state';
import { createContext, ReactNode, useContext } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAttributes } from '../content/attributes';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};
export const buttonContext = createContext({
  okAction: noop,
  cancelAction: noop,
});

export const QspCloseButton: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const preparedAttributes = useAttributes(attributes);
  return (
    <Dialog.Close asChild>
      <button {...preparedAttributes}>{children}</button>
    </Dialog.Close>
  );
};

export const QspOkButton: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const preparedAttributes = useAttributes(attributes);
  const { okAction } = useContext(buttonContext);
  return (
    <button {...preparedAttributes} onClick={okAction}>
      {children}
    </button>
  );
};

export const QspCancelButton: React.FC<{ attributes: Attributes; children: ReactNode }> = ({
  attributes,
  children,
}) => {
  const preparedAttributes = useAttributes(attributes);
  const { cancelAction } = useContext(buttonContext);
  return (
    <button {...preparedAttributes} onClick={cancelAction}>
      {children}
    </button>
  );
};

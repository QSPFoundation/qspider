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

export const QspCloseButton: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [, style, attributes] = useAttributes(attrs, 'button');
  return (
    <Dialog.Close asChild>
      <button style={style} {...attributes}>
        {children}
      </button>
    </Dialog.Close>
  );
};

export const QspOkButton: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [, style, attributes] = useAttributes(attrs, 'button');
  const { okAction } = useContext(buttonContext);
  return (
    <button style={style} {...attributes} onClick={okAction}>
      {children}
    </button>
  );
};

export const QspCancelButton: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [, style, attributes] = useAttributes(attrs, 'button');
  const { cancelAction } = useContext(buttonContext);
  return (
    <button style={style} {...attributes} onClick={cancelAction}>
      {children}
    </button>
  );
};
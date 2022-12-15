import { Attributes, cmdText$, isCmdVisible$, submitUserInput } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';

export const QspCmd: React.FC<{ attributes: Attributes; children: ReactNode }> = ({ attributes, children }) => {
  const preparedAttributes = useAttributes(attributes, 'qsp-cmd');
  const isVisible = useAtom(isCmdVisible$);
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e): void => {
    e.preventDefault();
    submitUserInput();
  };
  if (!isVisible) return null;
  return (
    <qsp-cmd {...preparedAttributes}>
      <form onSubmit={onSubmit}>{children}</form>
    </qsp-cmd>
  );
};

export const QspCmdInput: React.FC<{ attributes: Attributes }> = ({ attributes }) => {
  const value = useAtom(cmdText$);
  const preparedAttributes = useAttributes(attributes, 'input');
  const onInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    cmdText$.set((e.target as any).value);
  };
  return <input {...preparedAttributes} type="text" value={value} onInput={onInput} />;
};

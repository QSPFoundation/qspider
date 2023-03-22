import { Attributes, cmdText$, isCmdVisible$, submitUserInput } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';

export const QspCmd: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-cmd');
  const isVisible = useAtom(isCmdVisible$);
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e): void => {
    e.preventDefault();
    submitUserInput();
  };
  if (!isVisible) return null;
  return (
    <Tag style={style} {...attributes}>
      <form onSubmit={onSubmit}>{children}</form>
    </Tag>
  );
};

export const QspCmdInput: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const value = useAtom(cmdText$);
  const [, style, attributes] = useAttributes(attrs, 'input', 'qsp-cmd-input');
  const onInput: React.FormEventHandler<HTMLInputElement> = (e) => {
    cmdText$.set((e.target as HTMLInputElement).value);
  };
  return <input style={style} {...attributes} type="text" value={value} onInput={onInput} />;
};

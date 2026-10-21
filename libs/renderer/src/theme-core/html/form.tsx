import { ReactNode } from 'react';
import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';

export const HtmlForm: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  // `qsp-on:submit` is converted to `onSubmit` (preventDefault + execCode) by useAttributes.
  const [, style, attributes] = useAttributes(attrs, 'form');
  return (
    <form {...attributes} style={style}>
      {children}
    </form>
  );
};

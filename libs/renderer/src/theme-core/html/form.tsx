import { FormEvent, ReactNode } from 'react';
import { Attributes, qspApi$ } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';

export const HtmlForm: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [, style, attributes] = useAttributes(attrs, 'form');
  const qspSubmit = attributes['qspOn:submit'];
  delete attributes['qspOn:submit'];
  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    if (qspSubmit?.toLowerCase().startsWith('exec:')) {
      qspApi$.value?.execCode(qspSubmit.substring(5));
    }
  }
  return (
    <form {...attributes} style={style} onSubmit={onSubmit}>
      {children}
    </form>
  );
};

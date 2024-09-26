import { Attributes, execCode, execSelectedAction, selectAction } from '@qspider/game-state';
import React, { MouseEventHandler, useCallback } from 'react';
import { useAttributes } from '../../content/attributes';

export const Link: React.FC<{
  exec?: string;
  act?: number;
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ exec, act, children, attrs }) => {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      if (exec) {
        execCode(exec);
      } else if (act) {
        selectAction(act - 1);
        execSelectedAction();
      }
    },
    [exec, act],
  );
  const [, style, attributes] = useAttributes(attrs, 'a');
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a {...attributes} style={style} href="#" onClick={onClick}>
      {children}
    </a>
  );
};

export const HtmlLink: React.FC<{
  attrs: Attributes;
  children: React.ReactNode;
}> = ({ children, attrs }) => {
  const [, style, { href, ...attributes }] = useAttributes(attrs, 'a');
  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (attributes['onClick']) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      return (attributes['onClick'] as unknown as Function)(e);
    }
    if (href.startsWith('#')) {
      e.preventDefault();
      if (href !== '#') {
        window.location.hash = href;
      }
    }
  };
  return (
    <a target="_blank" rel="noreferrer" {...attributes} style={style} href={href} onClick={onClick}>
      {children}
    </a>
  );
};

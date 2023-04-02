import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';
import { CSSProperties, ReactNode } from 'react';
import { useQspBind } from '../../hooks/qsp-bind';

const QspBoundSelect: React.FC<{
  attributes: Omit<Attributes, 'style'>;
  style: CSSProperties;
  bind: string;
  bindKey: string;
  bindIndex: number;
  children: ReactNode;
}> = ({ attributes, style, bind, bindKey, bindIndex, children }) => {
  const [value, handleChange] = useQspBind(bind, bindKey, bindIndex);
  return (
    <select {...attributes} style={style} value={value} onChange={handleChange}>
      {children}
    </select>
  );
};

export const HtmlSelect: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [, style, { value, ...attributes }] = useAttributes(attrs, 'select');
  if ('qsp-bind' in attributes) {
    const bind = attributes['qsp-bind'];
    const bindKey = attributes['qsp-bind-key'];
    const bindIndex = parseInt(attributes['qsp-bind-index'] || '0', 10);
    return (
      <QspBoundSelect attributes={attributes} style={style} bind={bind} bindKey={bindKey} bindIndex={bindIndex}>
        {children}
      </QspBoundSelect>
    );
  }
  return (
    <select {...attributes} style={style} defaultValue={value}>
      {children}
    </select>
  );
};

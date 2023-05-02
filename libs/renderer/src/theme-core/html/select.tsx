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
  const [, style, { value, qspBind, qspBindKey, qspBindIndex, ...attributes }] = useAttributes(attrs, 'select');
  if (qspBind) {
    const bindIndex = parseInt(qspBindIndex || '0', 10);
    return (
      <QspBoundSelect attributes={attributes} style={style} bind={qspBind} bindKey={qspBindKey} bindIndex={bindIndex}>
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

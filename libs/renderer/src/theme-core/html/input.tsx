import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';
import { CSSProperties } from 'react';
import { useQspBind } from '../../hooks/qsp-bind';

const QspBoundInput: React.FC<{
  attributes: Omit<Attributes, 'style'>;
  style: CSSProperties;
  bind: string;
  bindKey: string;
  bindIndex: number;
  value?: string;
}> = ({ attributes, style, bind, bindKey, bindIndex, value }) => {
  const [bindValue, handleChange] = useQspBind(bind, bindKey, bindIndex);
  const type = attributes['type'] || 'text';
  if (type === 'radio') {
    return (
      <input
        {...attributes}
        style={style}
        type="radio"
        value={value}
        checked={bindValue === value}
        onChange={handleChange}
      />
    );
  }
  if (type === 'checkbox') {
    return (
      <input
        {...attributes}
        style={style}
        type="checkbox"
        value={value}
        checked={Boolean(bindValue)}
        onChange={handleChange}
      />
    );
  }
  return <input {...attributes} style={style} value={bindValue} onChange={handleChange} />;
};

export const HtmlInput: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [, style, { value, qspBind, qspBindKey, qspBindIndex, ...attributes }] = useAttributes(attrs, 'input');
  if (qspBind) {
    const bindIndex = parseInt(qspBindIndex || '0', 10);
    return (
      <QspBoundInput
        attributes={attributes}
        style={style}
        bind={qspBind}
        bindKey={qspBindKey}
        bindIndex={bindIndex}
        value={value}
      />
    );
  }
  return <input {...attributes} style={style} defaultValue={value} />;
};

import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';
import { CSSProperties } from 'react';
import { useQspBind } from '../../hooks/qsp-bind';

const QspBoundTextarea: React.FC<{
  attributes: Omit<Attributes, 'style'>;
  style: CSSProperties;
  bind: string;
  bindKey: string;
  bindIndex: number;
}> = ({ attributes, style, bind, bindKey, bindIndex }) => {
  const [value, handleChange] = useQspBind(bind, bindKey, bindIndex);
  return <textarea {...attributes} style={style} value={value} onChange={handleChange}></textarea>;
};

export const HtmlTextarea: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [, style, { value, qspBind, qspBindKey, qspBindIndex, ...attributes }] = useAttributes(attrs, 'textarea');
  if (qspBind) {
    const bindIndex = parseInt(qspBindIndex || '0', 10);
    return (
      <QspBoundTextarea
        attributes={attributes}
        style={style}
        bind={qspBind}
        bindKey={qspBindKey}
        bindIndex={bindIndex}
      ></QspBoundTextarea>
    );
  }
  return <textarea {...attributes} style={style} defaultValue={value}></textarea>;
};

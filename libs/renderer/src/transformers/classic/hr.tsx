import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';

export const Hr: React.FC<{ attributes: Attributes; width: string | null; size: string | null; noshade: boolean }> = ({
  attributes,
  width,
  size,
  noshade,
}) => {
  const { style, ...preparedAttributes } = useAttributes(attributes, 'span');
  const preparedStyle: React.CSSProperties = {
    ...((style as React.CSSProperties) || {}),
    borderWidth: Number(size) > 0 ? '1px' : '1px 0 0 0',
    borderStyle: noshade ? 'solid' : 'inset',
    borderColor: 'rgb(128, 128, 128)',
    borderRadius: '1px',
    height: `${size || '0'}px`,
    margin: '0.5em auto',
    width: width || '100%',
    backgroundColor: noshade ? 'rgb(128, 128, 128)' : 'transparent',
  };
  return <div {...preparedAttributes} style={preparedStyle}></div>;
};

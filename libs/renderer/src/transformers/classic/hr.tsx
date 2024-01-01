import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';

export const Hr: React.FC<{ attrs: Attributes; width: string | null; size: string | null; noshade: boolean }> = ({
  attrs,
  width,
  size,
  noshade,
}) => {
  const [, style, attributes] = useAttributes(attrs, 'hr');
  const preparedStyle: React.CSSProperties = {
    ...style,
    borderWidth: Number(size) > 0 ? '1px' : '1px 0 0 0',
    borderStyle: noshade ? 'solid' : 'inset',
    borderColor: 'rgb(128, 128, 128)',
    borderRadius: '1px',
    height: `${size || '0'}px`,
    margin: '0.5em auto',
    width: width || '100%',
    backgroundColor: noshade ? 'rgb(128, 128, 128)' : 'transparent',
  };
  return <div {...attributes} style={preparedStyle}></div>;
};

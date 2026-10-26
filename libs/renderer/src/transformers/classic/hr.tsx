import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';
import { hrStyle } from './legacy-styles';

export const Hr: React.FC<{ attrs: Attributes; width: string | null; size: string | null; noshade: boolean }> = ({
  attrs,
  width,
  size,
  noshade,
}) => {
  const [, style, attributes] = useAttributes(attrs, 'hr');
  const preparedStyle: React.CSSProperties = { ...style, ...hrStyle(width, size, noshade) };
  return <div {...attributes} style={preparedStyle}></div>;
};

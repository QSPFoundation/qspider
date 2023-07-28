import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';

export const HtmlImg: React.FC<{ src: string; attrs: Attributes }> = ({ attrs, src }) => {
  const [, style, attributes] = useAttributes(attrs, 'img');

  return <img src={src.replace('\\', '/')} alt="" style={style} {...attributes} />;
};

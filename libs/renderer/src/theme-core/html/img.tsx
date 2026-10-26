import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';
import { imgSrc } from './img-src';

export const HtmlImg: React.FC<{ src: string; attrs: Attributes }> = ({ attrs, src }) => {
  const [, style, attributes] = useAttributes(attrs, 'img');

  return <img src={imgSrc(src)} alt="" style={style} {...attributes} />;
};

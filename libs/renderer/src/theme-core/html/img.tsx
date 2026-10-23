import { cleanPath } from '@qspider/utils';
import { Attributes } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';

export const HtmlImg: React.FC<{ src: string; attrs: Attributes }> = ({ attrs, src }) => {
  const [, style, attributes] = useAttributes(attrs, 'img');

  return <img src={cleanPath(src)} alt="" style={style} {...attributes} />;
};

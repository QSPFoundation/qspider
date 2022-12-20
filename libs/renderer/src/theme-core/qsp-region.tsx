import { Attributes, regions$ } from '@qspider/game-state';
import { useAtom, useSetup } from '@xoid/react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';

export const QspRegion: React.FC<{ name: string; attrs: Attributes }> = ({ name, attrs }) => {
  const content$ = useSetup(() => {
    return regions$.focus((s) => s[name]);
  });
  const content = useAtom(content$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-region');
  return (
    <Tag data-region-name={name} style={style} {...attributes}>
      <ContentRenderer content={content} />
    </Tag>
  );
};

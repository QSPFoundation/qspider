import { Attributes, regions$ } from '@qspider/game-state';
import { useAtom, useSetup } from '@xoid/react';
import { create } from 'xoid';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';

export const QspRegion: React.FC<{ name: string; attrs: Attributes }> = (props) => {
  const content$ = useSetup((props$) => {
    const name$ = create((get) => get(props$).name);
    return create((get) => get(regions$)[get(name$)]);
  }, props);
  const content = useAtom(content$);
  const [Tag, style, attributes] = useAttributes(props.attrs, 'qsp-region');
  return (
    <Tag data-region-name={props.name} style={style} {...attributes}>
      <ContentRenderer content={content} />
    </Tag>
  );
};

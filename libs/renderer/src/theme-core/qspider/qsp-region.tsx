import { Attributes, regions$, regionsScroll$ } from '@qspider/game-state';
import { useAtom, useSetup } from '@xoid/react';
import { atom } from 'xoid';
import { ContentRenderer } from '../../content-renderer';
import { useAttributes } from '../../content/attributes';
import { QspScrollable, scrollContext } from '../scrollable';

export const QspRegion: React.FC<{ name: string; scrollable?: boolean; attrs: Attributes }> = (props) => {
  const content$ = useSetup((props$) => {
    const name$ = atom((get) => get(props$).name);
    return atom((get) => get(regions$)[get(name$)]);
  }, props);
  const scroll$ = useSetup((props$) => {
    const name$ = atom((get) => get(props$).name);
    return atom((get) => get(regionsScroll$)[get(name$)] ?? 0);
  }, props);
  const content = useAtom(content$);
  const [Tag, style, attributes] = useAttributes(props.attrs, 'qsp-region');
  if (props.scrollable) {
    return (
      <scrollContext.Provider value={scroll$}>
        <Tag data-region-name={props.name} style={style} {...attributes}>
          <QspScrollable attrs={{}}>
            <ContentRenderer content={content} />
          </QspScrollable>
        </Tag>
      </scrollContext.Provider>
    );
  }
  return (
    <Tag data-region-name={props.name} style={style} {...attributes}>
      <ContentRenderer content={content} />
    </Tag>
  );
};

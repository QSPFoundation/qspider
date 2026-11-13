import { Attributes, regionsScroll$, useQspVariable } from '@qspider/game-state';
import { useSetup } from '@xoid/react';
import { useMemo } from 'react';
import { atom } from 'xoid';
import { useAttributes } from '../../content/attributes';
import { QspScrollable, scrollContext } from '../scrollable';
import { templateParser } from '../../render-state';
import { Markup } from '@qspider/html-renderer';

export const QspRegion: React.FC<{ name: string; scrollable?: boolean; attrs: Attributes }> = (props) => {
  // A nameless region watches nothing (an empty key would read index 0).
  const text = useQspVariable(props.name ? '$qspider_region' : undefined, props.name ?? '', 0, '');
  const content = useMemo(() => templateParser.parse(text), [text]);
  const scroll$ = useSetup((props$) => {
    const name$ = atom((get) => get(props$).name);
    return atom((get) => get(regionsScroll$)[get(name$)] ?? 0);
  }, props);
  const [Tag, style, attributes] = useAttributes(props.attrs, 'qsp-region');
  if (props.scrollable) {
    return (
      <scrollContext.Provider value={scroll$}>
        <Tag data-region-name={props.name} style={style} {...attributes}>
          <QspScrollable attrs={{}}>
            <Markup content={content} />
          </QspScrollable>
        </Tag>
      </scrollContext.Provider>
    );
  }
  return (
    <Tag data-region-name={props.name} style={style} {...attributes}>
      <Markup content={content} />
    </Tag>
  );
};

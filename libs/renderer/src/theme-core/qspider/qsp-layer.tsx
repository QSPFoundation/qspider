import { Attributes, layers$, registerLayer } from '@qspider/game-state';
import { useAtom, useSetup } from '@xoid/react';
import { ReactNode, useEffect } from 'react';
import { atom } from 'xoid';
import { useAttributes } from '../../content/attributes';

export const QspLayer: React.FC<{ children: ReactNode; name: string; index: number; attrs: Attributes }> = (props) => {
  const isVisible$ = useSetup((props$) => {
    const name$ = atom((get) => get(props$).name);
    return atom((get) => get(layers$)[get(name$)]);
  }, props);
  const isVisible = useAtom(isVisible$);
  const [Tag, style, attributes] = useAttributes(props.attrs, 'qsp-layer');
  useEffect(() => registerLayer(props.name), []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!isVisible) return null;
  style.zIndex = props.index;
  return (
    <Tag {...attributes} style={style} data-layer-name={props.name}>
      {props.children}
    </Tag>
  );
};

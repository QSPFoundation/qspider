import { Attributes, useQspVariable } from '@qspider/game-state';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';

export const QspLayer: React.FC<{ children: ReactNode; name: string; index: number; attrs: Attributes }> = (props) => {
  const isVisible = Boolean(useQspVariable('#qspider_layers', props.name, 0, 0));
  const [Tag, style, attributes] = useAttributes(props.attrs, 'qsp-layer');
  if (!isVisible) return null;
  style.zIndex = props.index;
  return (
    <Tag {...attributes} style={style} data-layer-name={props.name}>
      {props.children}
    </Tag>
  );
};

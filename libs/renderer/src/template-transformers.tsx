import { Node } from 'interweave';
import { currentGameMode$ } from '@qspider/game-state';
import { atom } from 'xoid';
import { aeroTransformers, classicTransformers, defaultTransform, defaultTransformers } from './transformers';

const currentTransformers$ = atom((get) => {
  const mode = get(currentGameMode$);
  switch (mode) {
    case 'classic':
      return { ...defaultTransformers, ...classicTransformers };
    case 'aero':
      return { ...defaultTransformers, ...classicTransformers, ...aeroTransformers };
    case 'qspider':
    default:
      return defaultTransformers;
  }
});

export const transform = (node: HTMLElement, children: Node[]): React.ReactNode | null => {
  const transformer = currentTransformers$.value[node.tagName.toLowerCase()];
  if (transformer) {
    return transformer(node, children);
  }
  return defaultTransform(node, children);
};

import { TransformCallback } from '@qspider/html-renderer';
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

export const transform: TransformCallback = (node, children, config) => {
  const transformer = currentTransformers$.value[node.tagName.toLowerCase()];
  if (transformer) {
    return transformer(node, children, config);
  }
  return defaultTransform(node, children, config);
};

import { TransformCallback } from '@qspider/html-renderer';
import { currentGameMode$ } from '@qspider/game-state';
import { atom } from 'xoid';
import { pickTransformers } from './pick-transformers';
import { aeroTransformers, classicTransformers, defaultTransform, defaultTransformers } from './transformers';

const currentTransformers$ = atom((get) => {
  const mode = get(currentGameMode$);
  return pickTransformers(mode, { base: defaultTransformers, classic: classicTransformers, aero: aeroTransformers });
});

export const transform: TransformCallback = (node, children) => {
  const transformer = currentTransformers$.value[node.tagName.toLowerCase()];
  if (transformer) {
    return transformer(node, children);
  }
  return defaultTransform(node, children);
};

export function pickTransformers<T>(mode: string, sets: { base: T; classic: T; aero: T }): T {
  switch (mode) {
    case 'classic':
      return { ...sets.base, ...sets.classic };
    case 'aero':
      return { ...sets.base, ...sets.classic, ...sets.aero };
    case 'qspider':
    default:
      return sets.base;
  }
}

/**
 * The transformer the set holds for a tag, by its lowercased name. Own keys only: game text can write
 * `<constructor>`, which would otherwise find Object and crash the content tree.
 */
export function lookupTransformer<T>(set: Record<string, T>, tagName: string): T | undefined {
  const name = tagName.toLowerCase();
  return Object.prototype.hasOwnProperty.call(set, name) ? set[name] : undefined;
}

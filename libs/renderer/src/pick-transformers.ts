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

/** The transformer the set holds for a tag, by its lowercased name. */
export function lookupTransformer<T>(set: Record<string, T>, tagName: string): T | undefined {
  return set[tagName.toLowerCase()];
}

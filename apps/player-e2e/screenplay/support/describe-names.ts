/** A short step title for a list of names: the count and the first two (long titles overflow report file names). */
export const describeNames = (names: string[]): string =>
  `${names.length} values (${names.slice(0, 2).join(', ')}${names.length > 2 ? ', ...' : ''})`;

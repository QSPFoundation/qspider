export type ScrollType = 'both' | 'horizontal' | 'vertical';
export const isScrollType = (t: unknown): t is ScrollType =>
  typeof t === 'string' && ['both', 'horizontal', 'vertical'].includes(t);

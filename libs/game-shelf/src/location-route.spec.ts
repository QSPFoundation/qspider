import { describe, expect, it } from 'vitest';
import { routeOf } from './location-route';

describe('routeOf', () => {
  it('reads a game run without pause', () => {
    expect(routeOf('?run=abc')).toEqual({ kind: 'run', gameId: 'abc', pause: false });
  });

  it('reads a game run with the pause flag', () => {
    expect(routeOf('?run=abc&pause')).toEqual({ kind: 'run', gameId: 'abc', pause: true });
  });

  it('reads the catalog', () => {
    expect(routeOf('?catalog')).toEqual({ kind: 'catalog' });
  });

  it('falls back to the shelf for an empty search', () => {
    expect(routeOf('')).toEqual({ kind: 'shelf' });
  });

  it('falls back to the shelf for unrelated parameters', () => {
    expect(routeOf('?foo=1')).toEqual({ kind: 'shelf' });
  });

  it('does not treat an empty run value as a run', () => {
    expect(routeOf('?run=')).toEqual({ kind: 'shelf' });
    expect(routeOf('?run=&catalog')).toEqual({ kind: 'catalog' });
  });

  it('prefers a run over the catalog flag', () => {
    expect(routeOf('?run=abc&catalog')).toEqual({ kind: 'run', gameId: 'abc', pause: false });
  });
});

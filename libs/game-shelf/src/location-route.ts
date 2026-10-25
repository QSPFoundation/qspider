export type LocationRoute = { kind: 'run'; gameId: string; pause: boolean } | { kind: 'catalog' } | { kind: 'shelf' };

/** Which screen a location search string (`?run=<id>&pause`, `?catalog`) asks for; an empty `run` is not a run. */
export function routeOf(search: string): LocationRoute {
  const params = new URLSearchParams(search);
  const gameId = params.get('run');
  if (gameId) return { kind: 'run', gameId, pause: params.has('pause') };
  if (params.has('catalog')) return { kind: 'catalog' };
  return { kind: 'shelf' };
}

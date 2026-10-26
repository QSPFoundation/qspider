/** A menu offset attribute in pixels; missing or empty is 0. */
export function menuOffset(value: string | undefined): number {
  return value ? parseInt(value, 10) : 0;
}

/** The `index` of `<qsp-variable>`; missing or empty leaves the default index. */
export function variableIndex(value: string | undefined): number | undefined {
  return value ? parseInt(value, 10) : undefined;
}

/** The `index` of `<qsp-layer>`, used as its z-index. */
export function layerIndex(value: string | undefined): number {
  return parseInt(value as string);
}

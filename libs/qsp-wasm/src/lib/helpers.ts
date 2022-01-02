export function shallowEqual(obj1: unknown, obj2: unknown): boolean {
  return (
    Object.keys(obj1 as Record<string, unknown>).length === Object.keys(obj2 as Record<string, unknown>).length &&
    Object.keys(obj1 as Record<string, unknown>).every(
      (key) => (obj1 as Record<string, unknown>)[key] === (obj2 as Record<string, unknown>)[key]
    )
  );
}

export function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    let length: number;
    let i: number;
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) return false;
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
      return true;
    }

    const keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (!equal((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LOCALES_DIR = fileURLToPath(new URL('../../../../public/locales/', import.meta.url));

function bundle(lng: string, ns: string): Record<string, string> {
  try {
    return JSON.parse(readFileSync(`${LOCALES_DIR}${lng}/${ns}.json`, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

/**
 * The player's translation of `key` in `lng`, read from public/locales at test time, with the player's own
 * fallback to `en` (en-US ships an empty bundle). Throws when no bundle has the key.
 */
export function translation(lng: string, key: string): string {
  const value = bundle(lng, 'translation')[key] ?? bundle('en', 'translation')[key];
  if (value === undefined) throw new Error(`No translation of "${key}" in ${lng} or en`);
  return value;
}

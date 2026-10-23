import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LOCALES_DIR = fileURLToPath(new URL('../../../../public/locales/', import.meta.url));

function bundle(lng: string, ns: string): Record<string, string> {
  try {
    return JSON.parse(readFileSync(`${LOCALES_DIR}${lng}/${ns}.json`, 'utf8')) as Record<string, string>;
  } catch (error) {
    // A language without a bundle in this namespace falls back; anything else (bad JSON, permissions) is a real fault.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
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

/**
 * The player's translation of the plural key `key` in `lng` for `count`, interpolated like i18next does:
 * the `_<category>` variant of the key (category from Intl.PluralRules, as i18next uses), else the bare key,
 * with `{{ count }}` replaced. Falls back to `en` like `translation`.
 */
export function pluralTranslation(lng: string, key: string, count: number): string {
  const category = new Intl.PluralRules(lng).select(count);
  const pick = (code: string) => bundle(code, 'translation')[`${key}_${category}`] ?? bundle(code, 'translation')[key];
  const value = pick(lng) ?? pick('en'); // en has no plural variants: the bare key
  if (value === undefined) throw new Error(`No translation of "${key}" in ${lng} or en`);
  return value.replace(/\{\{\s*count\s*\}\}/g, String(count));
}

import type { ThemeData } from './theme-parser';

export const CLASSIC_THEME = 'qspider:classic';
export const AERO_THEME = 'qspider:aero';

export type ThemeRegistry = Record<string, ThemeData>;

/**
 * A game theme can't take the alias of a built-in one: `resetThemes` would drop it afterwards and the
 * built-in would be gone. A built-in theme can be registered again.
 */
export function addTheme(registry: ThemeRegistry, alias: string, data: ThemeData): ThemeRegistry {
  const existing = registry[alias];
  if (existing && !existing.is_user_defined && data.is_user_defined) return registry;
  return { ...registry, [alias]: data };
}

/** Drops the themes a game defined; the built-in ones stay. */
export function resetThemes(registry: ThemeRegistry): ThemeRegistry {
  return Object.entries(registry).reduce<ThemeRegistry>((acc, [key, data]) => {
    if (!data.is_user_defined) {
      acc[key] = data;
    }
    return acc;
  }, {});
}

export function themeDataOf(registry: ThemeRegistry, current: string): Partial<ThemeData> {
  return registry[current] ?? {};
}

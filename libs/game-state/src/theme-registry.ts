import type { ThemeData } from './theme-parser';

export const CLASSIC_THEME = 'qspider:classic';
export const AERO_THEME = 'qspider:aero';

export type ThemeRegistry = Record<string, ThemeData>;

export function addTheme(registry: ThemeRegistry, alias: string, data: ThemeData): ThemeRegistry {
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

import { atom } from 'xoid';
import { parseTheme, ThemeData } from './theme-parser';
import { addTheme, CLASSIC_THEME, resetThemes, ThemeRegistry, themeDataOf } from './theme-registry';
import { useQspVariable } from './qsp-api';
import { fetchTextContent } from '@qspider/env';
import { baseUrl$ } from './current-game';

export type { CssVarDefinition, TemplateTag, ThemeData } from './theme-parser';
export { AERO_THEME, CLASSIC_THEME } from './theme-registry';

export const DEFAULT_LIST_FORMAT =
  '<table><tr><td><img src="%IMAGE%"/></td><td style="width:100%;">%TEXT%</td></tr></table>';
export const DEFAULT_SELECTED_LIST_FORMAT =
  '<table><tr><td><img src="%IMAGE%"/></td><td style="width:100%;color:#0000FF;">%TEXT%</td></tr></table>';
export const TEXT_PLACEHOLDER = '%TEXT%';
export const IMAGE_PLACEHOLDER = '%IMAGE%';

interface ThemeActions {
  add(alias: string, data: ThemeData): void;
  reset(): void;
}

export const themeRegistry$ = atom<ThemeRegistry, ThemeActions>({}, (atom) => {
  return {
    add(alias: string, data: ThemeData): void {
      atom.update((s) => addTheme(s, alias, data));
    },
    reset(): void {
      atom.update(resetThemes);
    },
  };
});
export const currentTheme$ = atom(CLASSIC_THEME);
export const currentThemeData$ = atom((get) => {
  return themeDataOf(get(themeRegistry$), get(currentTheme$));
});
export const defaultClassicTheme$ = atom((get) => {
  return get(themeRegistry$)[CLASSIC_THEME];
});
export const currentCssVariables$ = atom((get) => get(currentThemeData$).css_variables ?? []);
export const currentCssLinks$ = atom((get) => get(currentThemeData$).css_links ?? []);
export const currentScriptLinks$ = atom((get) => get(currentThemeData$).script_links ?? []);
export const currentTranslations$ = atom((get) => get(currentThemeData$).translations ?? []);

export function useFormatVariable(variableName?: string, defaultValue?: string): string {
  return useQspVariable(variableName, '', 0, defaultValue ?? '');
}
export async function registerThemes(themes: string[]): Promise<void> {
  for (const themeUrl of themes) {
    const content = await fetchTextContent(baseUrl$.value, themeUrl);
    const parsedThemes = parseTheme(content);
    for (const [alias, data] of Object.entries(parsedThemes)) {
      themeRegistry$.actions.add(alias, data);
    }
  }
}

const defaultThemes = ['themes/classic.html', 'themes/aero.html'];
export async function registerDefaultThemes(baseUrl: string): Promise<void> {
  for (const themeUrl of defaultThemes) {
    const content = await fetch(new URL(themeUrl, baseUrl).href).then((r) => r.text());
    const parsedThemes = parseTheme(content, false);
    for (const [alias, data] of Object.entries(parsedThemes)) {
      themeRegistry$.actions.add(alias, data);
    }
  }
}

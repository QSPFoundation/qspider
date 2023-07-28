import { useAtom } from '@xoid/react';
import { create } from 'xoid';
import { Attributes, extractAttributes } from './attributes';
import { getTextContent } from './resources';
import classicTheme from './themes/classic.html?raw';
import aeroTheme from './themes/aero.html?raw';
import { useQspVariable } from './qsp-api';
import { ThemeTranslation } from '@qspider/contracts';

export const CLASSIC_THEME = 'qspider:classic';
export const AERO_THEME = 'qspider:aero';

export const DEFAULT_LIST_FORMAT =
  '<table><tr><td><img src="%IMAGE%"/></td><td style="width:100%;">%TEXT%</td></tr></table>';
export const DEFAULT_SELECTED_LIST_FORMAT =
  '<table><tr><td><img src="%IMAGE%"/></td><td style="width:100%;color:#0000FF;">%TEXT%</td></tr></table>';
export const TEXT_PLACEHOLDER = '%TEXT%';
export const IMAGE_PLACEHOLDER = '%IMAGE%';

export interface TemplateTag {
  attrs: Attributes;
  template: string;
}
export type CssVarDefinition = {
  name: string;
  from: string;
  defaultValue: string;
} & (
  | { type: null }
  | {
      type: 'unit';
      unit: string;
    }
  | {
      type: 'color';
      invert?: boolean;
      withContrast?: boolean;
      withInverted?: boolean;
    }
  | {
      type: 'resource';
      withSize: boolean;
    }
);

export type ThemeData = {
  is_user_defined: boolean;
  css_variables: CssVarDefinition[];
  translations: ThemeTranslation[];
  qsp_player?: TemplateTag;
};
interface ThemeActions {
  add(alias: string, data: ThemeData): void;
  reset(): void;
}

export const themeRegistry$ = create<Record<string, ThemeData>, ThemeActions>({}, (atom) => {
  return {
    add(alias: string, data: ThemeData): void {
      atom.update((s) => ({
        ...s,
        [alias]: data,
      }));
    },
    reset(): void {
      atom.update((s) => {
        return Object.entries(s).reduce<Record<string, ThemeData>>((acc, [key, data]) => {
          if (!data.is_user_defined) {
            acc[key] = data;
          }
          return acc;
        }, {});
      });
    },
  };
});
export const currentTheme$ = create(CLASSIC_THEME);
export const currentThemeData$ = create((get) => {
  return get(themeRegistry$)[get(currentTheme$)];
});
export const defaultClassicTheme$ = create((get) => {
  return get(themeRegistry$)['qspider:classic'];
});
export const currentCssVariables$ = create((get) => get(currentThemeData$).css_variables);
export const currentTranslations$ = create((get) => get(currentThemeData$).translations);

export function useThemeTemplate(
  tag: keyof Omit<ThemeData, 'is_user_defined' | 'css_variables' | 'translations'>,
  fallback?: keyof Omit<ThemeData, 'is_user_defined' | 'css_variables' | 'translations'>
): TemplateTag {
  const theme = useAtom(currentThemeData$);
  return (
    theme?.[tag] ||
    (fallback && theme?.[fallback]) || {
      attrs: {},
      template: `failed to find ${tag} template`,
    }
  );
}

export function useFormatVariable(variableName?: string, defaultValue?: string): string {
  return useQspVariable(variableName, '', 0, defaultValue ?? '');
}
export async function registerThemes(themes: string[]): Promise<void> {
  for (const themeUrl of themes) {
    const content = await getTextContent(themeUrl);
    const parsedThemes = parseTheme(content);
    for (const [alias, data] of Object.entries(parsedThemes)) {
      themeRegistry$.actions.add(alias, data);
    }
  }
}

const parser = new DOMParser();

function loadTheme(content: string): void {
  const parsedThemes = parseTheme(content, false);
  for (const [alias, data] of Object.entries(parsedThemes)) {
    themeRegistry$.actions.add(alias, data);
  }
}
loadTheme(classicTheme);
loadTheme(aeroTheme);

function parseTheme(content: string, is_user_defined = true): Record<string, ThemeData> {
  const themeData: Record<string, ThemeData> = {};
  const document = parser.parseFromString(content, 'text/html');
  const themes = document.querySelectorAll<HTMLElement>('qspider-theme');
  for (const theme of themes) {
    const name = theme.getAttribute('name');
    if (!name) {
      console.error('Malformed theme definition - missing theme name in qspider-theme tag');
      continue;
    }
    themeData[name] = {
      is_user_defined,
      css_variables: extractCssVariables(theme),
      translations: extractTranslations(theme),
      qsp_player: extractTagData(theme, 'qsp-player'),
    };
  }
  return themeData;
}

function extractTagData(root: HTMLElement, selector: string): TemplateTag | undefined {
  const node = root.querySelector<HTMLElement>(selector);
  if (!node) return;
  return {
    attrs: extractAttributes(node),
    template: node.innerHTML.replace(/[ \t]*\r?\n[ \t]*/gm, ''),
  };
}

function extractCssVariables(root: HTMLElement): CssVarDefinition[] {
  const definitions: CssVarDefinition[] = [];
  for (const node of root.querySelectorAll('definitions qsp-css-variable')) {
    const name = node.getAttribute('name');
    const from = node.getAttribute('from');
    if (!name || !from) continue;
    definitions.push({
      name,
      from,
      defaultValue: node.getAttribute('default-value') || '',
      type: node.getAttribute('type'),
      unit: node.getAttribute('unit'),
      withSize: node.hasAttribute('with-size'),
      withContrast: node.hasAttribute('with-contrast'),
      withInverted: node.hasAttribute('with-inverted'),
    } as CssVarDefinition);
  }
  return definitions;
}

function extractTranslations(root: HTMLElement): ThemeTranslation[] {
  const translations: ThemeTranslation[] = [];
  for (const node of root.querySelectorAll('definitions qsp-translation')) {
    const lang = node.getAttribute('lang') || '';
    const tkey = node.getAttribute('tkey') || '';
    const value = node.getAttribute('value') || '';
    translations.push({
      lang,
      tkey,
      value,
    });
  }
  return translations;
}

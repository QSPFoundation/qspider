import { ThemeTranslation } from '@qspider/contracts';
import { Attributes, extractAttributes } from './attributes';

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
  css_links: string[];
  script_links: string[];
  qsp_player?: TemplateTag;
};

let parser: DOMParser | undefined;
/** Created on first use, so importing this file needs no DOM. */
function domParser(): DOMParser {
  parser ??= new DOMParser();
  return parser;
}

export function parseTheme(content: string, is_user_defined = true): Record<string, ThemeData> {
  const themeData: Record<string, ThemeData> = {};
  const document = domParser().parseFromString(content, 'text/html');
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
      css_links: extractLinks(theme, 'css-link'),
      script_links: extractLinks(theme, 'script-link'),
      qsp_player: extractTagData(theme, 'qsp-player'),
    };
  }
  return themeData;
}

export function extractTagData(root: HTMLElement, selector: string): TemplateTag | undefined {
  const node = root.querySelector<HTMLElement>(selector);
  if (!node) return;
  return {
    attrs: extractAttributes(node),
    template: node.innerHTML.replace(/[ \t]*\r?\n[ \t]*/gm, ''),
  };
}

export function extractCssVariables(root: HTMLElement): CssVarDefinition[] {
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

export function extractTranslations(root: HTMLElement): ThemeTranslation[] {
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

export function extractLinks(root: HTMLElement, tag: string): string[] {
  const list: string[] = [];
  for (const node of root.querySelectorAll(tag)) {
    const src = node.getAttribute('src');
    if (src) list.push(src);
  }
  return list;
}

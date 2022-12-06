import { useAtom } from '@xoid/react';
import { Attributes } from 'interweave';
import { create, use } from 'xoid';
import { extractAttributes } from './attributes';
import { getTextContent } from './resources';

export const BASE_THEME = 'qspider-base';

export interface TemplateTag {
  attrs: Attributes;
  template: string;
}
export type ThemeData = {
  is_user_defined: boolean;
  qsp_player?: TemplateTag;
  qsp_action?: TemplateTag;
  qsp_object?: TemplateTag;
  qsp_menu_item?: TemplateTag;
  qsp_menu_separator?: TemplateTag;
  qsp_pause_screen?: TemplateTag;
  qsp_save_slot?: TemplateTag;
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
export const currentTheme$ = create(BASE_THEME);
export const currentThemeData$ = create((get) => {
  return get(themeRegistry$)[get(currentTheme$)];
});

export function useThemeTemplate(tag: keyof Omit<ThemeData, 'is_user_defined'>): TemplateTag {
  const theme = useAtom(currentThemeData$);
  return (
    theme?.[tag] || {
      attrs: {},
      template: `failed to find ${tag} template`,
    }
  );
}

export async function registerThemes(themes: string[]): Promise<void> {
  for (const themeUrl of themes) {
    const content = await getTextContent(themeUrl);
    const parsedThemes = parseTheme(content);
    for (const [alias, data] of Object.entries(parsedThemes)) {
      use(themeRegistry$).add(alias, data);
    }
  }
}

const parser = new DOMParser();
function parseTheme(content: string): Record<string, ThemeData> {
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
      is_user_defined: true,
      qsp_player: extractTagData(theme, 'template[is="qsp-player"]'),
      qsp_action: extractTagData(theme, 'template[is="qsp-action"]'),
      qsp_object: extractTagData(theme, 'template[is="qsp-object"]'),
      qsp_menu_item: extractTagData(theme, 'template[is="qsp-menu-item"]'),
      qsp_menu_separator: extractTagData(theme, 'template[is="qsp-menu-separator"]'),
      qsp_pause_screen: extractTagData(theme, 'template[is="qsp-pause-screen"]'),
      qsp_save_slot: extractTagData(theme, 'template[is="qsp-save-slot"]'),
    };
  }
  return themeData;
}

function extractTagData(root: HTMLElement, selector: string): TemplateTag | undefined {
  const node = root.querySelector<HTMLElement>(selector);
  if (!node) return;
  return {
    attrs: extractAttributes(node),
    template: node.innerHTML,
  };
}

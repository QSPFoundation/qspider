import { Atom, atom } from 'xoid';
import {
  actions$,
  buildLayoutTree,
  convertLayer,
  convertPane,
  currentGameEntry$,
  currentThemeData$,
  DEFAULT_LIST_FORMAT,
  DEFAULT_SELECTED_LIST_FORMAT,
  defaultClassicTheme$,
  IMAGE_PLACEHOLDER,
  input$,
  mainContent$,
  menu$,
  msg$,
  objects$,
  qspApi$,
  qspGuiCfg$,
  selectedAction$,
  selectedMenuItem$,
  selectedObject$,
  statsContent$,
  TEXT_PLACEHOLDER,
} from '@qspider/game-state';
import { HtmlParser, RenderNode } from '@qspider/html-renderer';
import { transform } from './template-transformers';

export interface ListItemWithParsedContent {
  name: RenderNode[];
  image: string;
}

export const templateParser = new HtmlParser({
  transform,
});

export const currentGameDescription$ = atom((get) => {
  const entry = get(currentGameEntry$);
  if (!entry?.description) return [];
  return templateParser.parse(entry.description);
});

export const playerTemplate$ = atom((get) => {
  const theme = get(currentThemeData$);
  const player = theme.qsp_player ?? { template: '', attrs: {} };
  const { attrs, template } = player;
  return { attrs, template: templateParser.parse(template, false) };
});

export const qspGuiLayout$ = atom((get) => {
  const config = get(qspGuiCfg$);
  if (!config) return null;
  const defaultTheme = get(defaultClassicTheme$).qsp_player?.template ?? '';
  const layout = buildLayoutTree(config.Panels);
  let template = '';
  if (layout.layer) template += convertLayer(layout.layer, config.Docks, defaultTheme);
  for (const floating of layout.floating) {
    template += convertPane(floating, defaultTheme, true);
  }
  return templateParser.parse(template, false);
});

export const parsedMainContent$ = atom((get) => {
  const content = get(mainContent$);
  return templateParser.parse(content);
});

export const parsedStatsContent$ = atom((get) => {
  const content = get(statsContent$);
  return templateParser.parse(content);
});

export const parsedMsgContent$ = atom((get) => {
  const msg = get(msg$);
  return templateParser.parse(msg.content);
});

export const parserInputContent$ = atom((get) => {
  const input = get(input$);
  return templateParser.parse(input.content);
});

export const actionsWithParsedName$ = atom((get) => {
  const actions = get(actions$);
  return actions.map((a) => ({ ...a, name: templateParser.parse(a.name) }));
});

export const objectsWithParsedName$ = atom((get) => {
  const objects = get(objects$);
  return objects.map((o) => ({ ...o, name: templateParser.parse(o.name) }));
});

export const menuWithParsedName$ = atom((get) => {
  const menu = get(menu$);
  return menu.items.map((o) => ({ ...o, name: templateParser.parse(o.name) }));
});

function createVariableAtom(name: string, defaultValue?: string): Atom<string> {
  const atom$ = atom(defaultValue ?? '');
  qspApi$.watch((api) => {
    api?.watchVariable(name, 0, (value) => {
      console.log('watchVariable', name, value);
      atom$.set((value as unknown as string) || defaultValue || '');
    });
  });
  return atom$;
}

const mainFormat$ = createVariableAtom('$MAIN_FORMAT');
export const aeroParsedMainContent$ = atom((get) => {
  let content = get(mainContent$);
  const format = get(mainFormat$);
  if (format) {
    content = format.replace(TEXT_PLACEHOLDER, content);
  }
  return templateParser.parse(content);
});

const statsFormat$ = createVariableAtom('$STATS_FORMAT');
export const aeroParsedStatsContent$ = atom((get) => {
  let content = get(statsContent$);
  const format = get(statsFormat$);
  if (format) {
    content = format.replace(TEXT_PLACEHOLDER, content);
  }
  return templateParser.parse(content);
});

const inputFormat$ = createVariableAtom('$INPUT_FORMAT');
export const aeroParsedInputContent$ = atom((get) => {
  let content = get(input$).content;
  const format = get(inputFormat$);
  if (format) {
    content = format.replace(TEXT_PLACEHOLDER, content);
  }
  return templateParser.parse(content);
});

const msgFormat$ = createVariableAtom('$MSG_FORMAT');
export const aeroParsedMsgContent$ = atom((get) => {
  let content = get(msg$).content;
  const format = get(msgFormat$);
  if (format) {
    content = format.replace(TEXT_PLACEHOLDER, content);
  }
  return templateParser.parse(content);
});

const actionFormat$ = createVariableAtom('$ACTION_FORMAT', DEFAULT_LIST_FORMAT);
const selectedActionFormat$ = createVariableAtom('$SEL_ACTION_FORMAT', DEFAULT_SELECTED_LIST_FORMAT);

export const aeroActionsWithParsedName$ = atom((get) => {
  const actions = get(actions$);
  const format = get(actionFormat$);
  const selectedFormat = get(selectedActionFormat$);
  const selectedAction = get(selectedAction$);

  return actions.map((a, index) => {
    const currentFormat = index === selectedAction ? selectedFormat : format;
    return {
      ...a,
      name: templateParser.parse(
        currentFormat.replace(TEXT_PLACEHOLDER, a.name).replace(IMAGE_PLACEHOLDER, a.image || ''),
      ),
    };
  });
});

const objectsFormat$ = createVariableAtom('$OBJECT_FORMAT', DEFAULT_LIST_FORMAT);
const selectedObjectFormat$ = createVariableAtom('$SEL_OBJECT_FORMAT', DEFAULT_SELECTED_LIST_FORMAT);

export const aeroObjectsWithParsedName$ = atom((get) => {
  const objects = get(objects$);
  const format = get(objectsFormat$);
  const selectedFormat = get(selectedObjectFormat$);
  const selectedObject = get(selectedObject$);

  return objects.map((o, index) => {
    const currentFormat = index === selectedObject ? selectedFormat : format;
    return {
      ...o,
      name: templateParser.parse(
        currentFormat.replace(TEXT_PLACEHOLDER, o.name).replace(IMAGE_PLACEHOLDER, o.image || ''),
      ),
    };
  });
});

const menuFormat$ = createVariableAtom('$MENU_FORMAT', DEFAULT_LIST_FORMAT);
const selectedMenuFormat$ = createVariableAtom('$SEL_MENU_FORMAT', DEFAULT_SELECTED_LIST_FORMAT);

export const aeroMenuWithParsedName$ = atom((get) => {
  const menu = get(menu$);
  const format = get(menuFormat$);
  const selectedFormat = get(selectedMenuFormat$);
  const selectedItem = get(selectedMenuItem$);

  return menu.items.map((o, index) => {
    const currentFormat = index === selectedItem ? selectedFormat : format;
    return {
      ...o,
      name: templateParser.parse(
        currentFormat.replace(TEXT_PLACEHOLDER, o.name).replace(IMAGE_PLACEHOLDER, o.image || ''),
      ),
    };
  });
});

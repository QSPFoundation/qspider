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
  hasBrowserTranslation$,
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

let mainContentKey = 0;
export const parsedMainContent$ = atom((get) => {
  const content = get(mainContent$);
  if (!get(hasBrowserTranslation$)) mainContentKey = 0;
  return { content: templateParser.parse(content), key: mainContentKey++ };
});

let statsContentKey = 0;
export const parsedStatsContent$ = atom((get) => {
  const content = get(statsContent$);
  if (!get(hasBrowserTranslation$)) statsContentKey = 0;
  return { content: templateParser.parse(content), key: statsContentKey++ };
});

let msgKey = 0;
export const parsedMsgContent$ = atom((get) => {
  const msg = get(msg$);
  if (!get(hasBrowserTranslation$)) msgKey = 0;
  return { content: templateParser.parse(msg.content), key: msgKey++ };
});

let inputKey = 0;
export const parsedInputContent$ = atom((get) => {
  const input = get(input$);
  if (!get(hasBrowserTranslation$)) inputKey = 0;
  return { content: templateParser.parse(input.content), key: inputKey++ };
});

let actionsKey = 0;
export const actionsWithParsedName$ = atom((get) => {
  const actions = get(actions$);
  if (!get(hasBrowserTranslation$)) actionsKey = 0;
  return actions.map((a) => ({ ...a, name: templateParser.parse(a.name), key: actionsKey++ }));
});

let objectsKey = 0;
export const objectsWithParsedName$ = atom((get) => {
  const objects = get(objects$);
  if (!get(hasBrowserTranslation$)) objectsKey = 0;
  return objects.map((o) => ({ ...o, name: templateParser.parse(o.title || o.name), key: objectsKey++ }));
});

let menuKey = 0;
export const menuWithParsedName$ = atom((get) => {
  const menu = get(menu$);
  if (!get(hasBrowserTranslation$)) menuKey = 0;
  return menu.items.map((o) => ({ ...o, name: templateParser.parse(o.name), key: menuKey++ }));
});

function createVariableAtom(name: string, defaultValue?: string): Atom<string> {
  const atom$ = atom(defaultValue ?? '');
  qspApi$.watch((api) => {
    api?.watchVariable(name, (value) => {
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
  if (!get(hasBrowserTranslation$)) mainContentKey = 0;
  return { content: templateParser.parse(content), key: mainContentKey++ };
});

const statsFormat$ = createVariableAtom('$STATS_FORMAT');
export const aeroParsedStatsContent$ = atom((get) => {
  let content = get(statsContent$);
  const format = get(statsFormat$);
  if (format) {
    content = format.replace(TEXT_PLACEHOLDER, content);
  }
  if (!get(hasBrowserTranslation$)) statsContentKey = 0;
  return { content: templateParser.parse(content), key: statsContentKey++ };
});

const inputFormat$ = createVariableAtom('$INPUT_FORMAT');
export const aeroParsedInputContent$ = atom((get) => {
  let content = get(input$).content;
  const format = get(inputFormat$);
  if (format) {
    content = format.replace(TEXT_PLACEHOLDER, content);
  }
  if (!get(hasBrowserTranslation$)) inputKey = 0;
  return { content: templateParser.parse(content), key: inputKey++ };
});

const msgFormat$ = createVariableAtom('$MSG_FORMAT');
export const aeroParsedMsgContent$ = atom((get) => {
  let content = get(msg$).content;
  const format = get(msgFormat$);
  if (format) {
    content = format.replace(TEXT_PLACEHOLDER, content);
  }
  if (!get(hasBrowserTranslation$)) msgKey = 0;
  return { content: templateParser.parse(content), key: msgKey++ };
});

const actionFormat$ = createVariableAtom('$ACTION_FORMAT', DEFAULT_LIST_FORMAT);
const selectedActionFormat$ = createVariableAtom('$SEL_ACTION_FORMAT', DEFAULT_SELECTED_LIST_FORMAT);

export const aeroActionsWithParsedName$ = atom((get) => {
  const actions = get(actions$);
  const format = get(actionFormat$);
  const selectedFormat = get(selectedActionFormat$);
  const selectedAction = get(selectedAction$);
  if (!get(hasBrowserTranslation$)) actionsKey = 0;

  return actions.map((a, index) => {
    const currentFormat = index === selectedAction ? selectedFormat : format;
    return {
      ...a,
      name: templateParser.parse(
        currentFormat.replace(TEXT_PLACEHOLDER, a.name).replace(IMAGE_PLACEHOLDER, a.image || ''),
      ),
      key: actionsKey++,
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

  if (!get(hasBrowserTranslation$)) objectsKey = 0;

  return objects.map((o, index) => {
    const currentFormat = index === selectedObject ? selectedFormat : format;
    const displayText = o.title || o.name;
    return {
      ...o,
      name: templateParser.parse(
        currentFormat.replace(TEXT_PLACEHOLDER, displayText).replace(IMAGE_PLACEHOLDER, o.image || ''),
      ),
      key: objectsKey++,
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

  if (!get(hasBrowserTranslation$)) menuKey = 0;

  return menu.items.map((o, index) => {
    const currentFormat = index === selectedItem ? selectedFormat : format;
    return {
      ...o,
      name: templateParser.parse(
        currentFormat.replace(TEXT_PLACEHOLDER, o.name).replace(IMAGE_PLACEHOLDER, o.image || ''),
      ),
      key: menuKey++,
    };
  });
});

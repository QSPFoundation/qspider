import {
  Attributes,
  EventAttributes,
  GameCommand,
  QspSaveCommand,
  SaveContext,
  execCode,
  onGameCommand,
  onSaveCommand,
} from '@qspider/game-state';
import { fontSizeMap } from '../transformers/classic/font';

const ATTRIBUTES_TO_PROPS: Record<string, string> = Object.freeze({
  class: 'className',
  colspan: 'colSpan',
  datetime: 'dateTime',
  rowspan: 'rowSpan',
  srclang: 'srcLang',
  srcset: 'srcSet',
  usemap: 'useMap',
  cellspacing: 'cellSpacing',
  cellpadding: 'cellPadding',
  autoplay: 'autoPlay',
  'xlink:href': 'xlinkHref',
  'xmlns:xlink': 'xmlnsXlink',
  for: 'htmlFor',
  minlength: 'minLength',
  maxlength: 'maxLength',
});

const attributeToStyle: Record<string, string> = {
  size: 'fontSize',
  color: 'color',
  face: 'fontFace',
  valign: 'verticalAlign',
  bgcolor: 'backgroundColor',
  width: 'width',
  height: 'height',
};
const imgAlignMap: Record<string, string> = {
  texttop: 'text-top',
  center: 'middle',
  abscenter: 'middle',
  bottom: 'bottom',
};

const attributeToStyleConverters: Record<string, (value: string) => string> = {
  width: (value: string): string => (/^\d+$/.test(value) ? `${value}px` : value),
  height: (value: string): string => (/^\d+$/.test(value) ? `${value}px` : value),
  fontSize: (value: string): string => (/^[+-]?\d+$/.test(value) ? fontSizeMap[value] : value),
};

const attributesToStyle = (attributes: Attributes, tag: string): Record<string, string> => {
  const style: Record<string, string> = {};
  for (const name of Object.keys(attributes)) {
    const styleName = attributeToStyle[name];
    if (tag === 'img' && name === 'align') {
      const value = attributes[name]?.toLowerCase();
      if (value) {
        const convertedValue = imgAlignMap[value];
        if (convertedValue) {
          style['verticalAlign'] = convertedValue;
        }
      }
    }
    if (styleName) {
      const value = attributes[name];
      if (!value) continue;
      if (attributeToStyleConverters[styleName]) {
        style[styleName] = attributeToStyleConverters[styleName](value);
      } else {
        style[styleName] = value;
      }
    }
  }
  return style;
};

const supportedEvents = ['click', 'mouseenter', 'mouseleave', 'contextmenu', 'dblclick', 'wheel'];
const eventsMap: Record<string, keyof EventAttributes> = {
  click: 'onClick',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  contextmenu: 'onContextMenu',
  dblclick: 'onDoubleClick',
};
export const useAttributes = <Tag extends keyof JSX.IntrinsicElements>(
  attributes: Attributes,
  tagName: Tag,
  dataName: string = tagName,
): [Tag, React.CSSProperties, Omit<Attributes, 'style'>] => {
  const converted: Attributes = {};
  if (dataName.includes('-')) {
    converted['data-qsp'] = dataName.replace('qsp-', '');
  }
  const {
    tag = tagName,
    style = {},
    'qsp-command': qspCommand,
    'qsp-save-command': qspSaveCommand,
    ...attrs
  } = attributes;

  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on')) continue;
    if (key.startsWith('qsp-on')) {
      const code = (value as string).slice(5);
      const [, event] = key.split(':');
      if (supportedEvents.includes(event)) {
        converted[eventsMap[event as keyof typeof eventsMap]] = (e: MouseEvent): void => {
          e.preventDefault();
          execCode(code);
        };
      }
      continue;
    }
    let preparedKey = ATTRIBUTES_TO_PROPS[key] || key;
    if (
      preparedKey.includes('-') &&
      !preparedKey.startsWith('aria-') &&
      !preparedKey.startsWith('data-') &&
      preparedKey !== 'mask-type'
    ) {
      preparedKey = preparedKey.replace(/-([a-z])/g, function (m, w) {
        return w.toUpperCase();
      });
    }
    converted[preparedKey] = value as string;
  }

  if (tag.includes('-') && converted['className']) {
    converted['class'] = converted['className'];
    delete converted['className'];
  }
  if (tag === 'iframe') {
    converted['sandbox'] = 'allow-scripts allow-same-origin';
  }
  if (qspCommand) {
    converted['onClick'] = (e: MouseEvent): void => {
      e.preventDefault();
      onGameCommand(qspCommand as GameCommand);
    };
    converted['data-qsp-command'] = qspCommand;
  } else if (qspSaveCommand) {
    converted['data-qsp-save-command'] = qspSaveCommand;
    converted['onClick'] = (e: MouseEvent): void => {
      e.preventDefault();
      if (!e.target) return;
      const context = getSaveContext(e.target as HTMLElement);
      if (!context) return;
      onSaveCommand(qspSaveCommand as QspSaveCommand, context);
    };
  }
  const attributeStyles = attributesToStyle(attributes, tag);
  return [
    tag as Tag,
    {
      ...style,
      ...attributeStyles,
    },
    converted,
  ];
};

function getSaveContext(target: HTMLElement): SaveContext | null {
  const saveRoot = target.closest<HTMLElement>('[data-qsp-save]');
  if (!saveRoot) {
    console.error('qsp-save-command used on element outside of save tag');
    return null;
  }
  const slot_index = 'qspSaveIndex' in saveRoot.dataset ? parseInt(saveRoot.dataset['qspSaveIndex'] ?? '-1', 0) : -1;
  const save_path = saveRoot.dataset['qspSavePath'] ?? '';
  return {
    slot_index,
    save_path,
  };
}

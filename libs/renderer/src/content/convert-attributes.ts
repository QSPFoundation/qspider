import type { Attributes, EventAttributes } from '@qspider/game-state';
import { fontSizeMap } from './font-sizes';

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

export const attributesToStyle = (attributes: Attributes, tag: string): Record<string, string> => {
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

const supportedEvents = ['click', 'mouseenter', 'mouseleave', 'contextmenu', 'dblclick', 'wheel', 'submit'];
const eventsMap: Record<string, keyof EventAttributes> = {
  click: 'onClick',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  contextmenu: 'onContextMenu',
  dblclick: 'onDoubleClick',
  submit: 'onSubmit',
};

export interface ConvertedAttributes {
  tag: string;
  style: React.CSSProperties;
  props: Record<string, unknown>;
  events: { prop: keyof EventAttributes; code: string }[];
  command: { kind: 'game' | 'save'; value: string } | null;
}

export function convertAttributes(
  attributes: Attributes,
  tagName: string,
  dataName: string = tagName,
): ConvertedAttributes {
  const props: Record<string, unknown> = {};
  const events: ConvertedAttributes['events'] = [];
  if (dataName.includes('-')) {
    props['data-qsp'] = dataName.replace('qsp-', '');
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
        events.push({ prop: eventsMap[event], code });
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
    props[preparedKey] = value as string;
  }

  if ((tag as string).includes('-') && props['className']) {
    props['class'] = props['className'];
    delete props['className'];
  }
  if (tag === 'iframe') {
    props['sandbox'] = 'allow-scripts';
  }
  let command: ConvertedAttributes['command'] = null;
  if (qspCommand) {
    props['data-qsp-command'] = qspCommand;
    command = { kind: 'game', value: qspCommand as string };
  } else if (qspSaveCommand) {
    props['data-qsp-save-command'] = qspSaveCommand;
    command = { kind: 'save', value: qspSaveCommand as string };
  }
  return {
    tag: tag as string,
    style: { ...style, ...attributesToStyle(attributes, tag as string) },
    props,
    events,
    command,
  };
}

import parse from 'srcset-parse';
import { Attributes, GameAction, getResource, onGameAction } from '@qspider/game-state';
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

function processUrl(url: string): string {
  return getResource(url).url || 'not-found.png';
}

const attributeConverters: Record<string, (value: string) => string> = {
  src: processUrl,
  poster: processUrl,
  srcset(value: string) {
    return parse(value)
      .map((row) => {
        const suffix = [];
        if (row.density) {
          suffix.push(`${row.density}x`);
        }
        if (row.width) {
          suffix.push(`${row.width}w`);
        }
        return `${processUrl(row.url)} ${suffix.join(' ')}`;
      })
      .join(', ');
  },
};

export const useAttributes = <Tag extends keyof JSX.IntrinsicElements>(
  attributes: Attributes,
  tagName: Tag,
  dataName: string = tagName
): [Tag, React.CSSProperties, Omit<Attributes, 'style'>] => {
  const converted: Attributes = {};
  if (dataName.includes('-')) {
    converted['data-qsp'] = dataName.replace('qsp-', '');
  }
  const { tag = tagName, style = {}, 'qsp-action': qspAction, ...attrs } = attributes;

  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on')) continue;
    let newValue = value;
    if (key in attributeConverters) {
      newValue = attributeConverters[key](value as string);
    }
    if ((tag === 'image' && key === 'href') || key === 'xlink:href') {
      newValue = processUrl(value as string);
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
    converted[preparedKey] = newValue as string;
  }

  if (tag.includes('-') && converted['className']) {
    converted['class'] = converted['className'];
    delete converted['className'];
  }
  if (tag === 'iframe') {
    converted['sandbox'] = 'allow-scripts allow-same-origin';
  }
  if (qspAction) {
    converted['onClick'] = (e: MouseEvent): void => {
      e.preventDefault();
      onGameAction(qspAction as GameAction);
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

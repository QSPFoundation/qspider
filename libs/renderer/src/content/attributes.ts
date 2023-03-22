import { Attributes, getResource } from '@qspider/game-state';
import { fontSizeMap } from '../transformers/classic/font';

const resourceAttributes = ['src', 'poster'];
const ATTRIBUTES_TO_PROPS: Record<string, string> = Object.freeze({
  class: 'className',
  colspan: 'colSpan',
  datetime: 'dateTime',
  rowspan: 'rowSpan',
  srclang: 'srcLang',
  srcset: 'srcSet',
  usemap: 'useMap',
  cellspacing: 'cellSpacing',
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
const attributeConverters: Record<string, (value: string) => string> = {
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
      if (attributeConverters[styleName]) {
        style[styleName] = attributeConverters[styleName](value);
      } else {
        style[styleName] = value;
      }
    }
  }
  return style;
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
  const { tag = tagName, style = {}, ...attrs } = attributes;
  for (const [key, value] of Object.entries(attrs)) {
    let newValue = value;
    if (resourceAttributes.includes(key)) {
      newValue = getResource(value as string).url;
    }
    converted[ATTRIBUTES_TO_PROPS[key] || key] = newValue as string;
  }

  if (tag.includes('-') && converted['className']) {
    converted['class'] = converted['className'];
    delete converted['className'];
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

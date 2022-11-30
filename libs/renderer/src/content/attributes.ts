import { Attributes, getResource } from '@qspider/game-state';

const resourceAttributes = ['src', 'poster'];
const ATTRIBUTES_TO_PROPS: Record<string, string> = Object.freeze({
  class: 'className',
  colspan: 'colSpan',
  datetime: 'dateTime',
  rowspan: 'rowSpan',
  srclang: 'srcLang',
  srcset: 'srcSet',
  usemap: 'useMap',
});

export const useAttributes = (attributes: Attributes): Attributes => {
  const converted: Attributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    let newValue = value;
    if (resourceAttributes.includes(key)) {
      newValue = getResource(value as string).url;
    }
    converted[ATTRIBUTES_TO_PROPS[key] || key] = newValue;
  }
  return converted;
};

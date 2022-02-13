import { useResources } from '@qspider/providers';
import { ATTRIBUTES_TO_PROPS } from 'interweave';

export type AttributeValue = boolean | number | object | string;

export interface Attributes {
  [attr: string]: AttributeValue;
}

const resourceAttributes = ['src', 'poster'];
const additionaNames: Record<string, string> = {
  usemap: 'useMap',
};

export const useAttributes = (attributes: Attributes): Attributes => {
  const resources = useResources();
  const converted: Attributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'style') continue;
    let newValue = value;
    if (resourceAttributes.includes(key)) {
      newValue = resources.get(value as string).url;
    }
    converted[ATTRIBUTES_TO_PROPS[key] || additionaNames[key] || key] = newValue;
  }
  return converted;
};

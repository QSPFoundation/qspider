export type AttributeValue = boolean | number | object | string;

export interface Attributes {
  [attr: string]: AttributeValue;
}

export function extractAttributes(node: HTMLElement): Attributes {
  const attributes: Attributes = {};
  Array.from(node.attributes).forEach((attr) => {
    const { name, value } = attr;
    if (name === 'is') return;
    if (name === 'style') {
      attributes[name] = parseStyles(value);
    } else {
      attributes[name] = value;
    }
  });
  return attributes;
}

function parseStyles(styles: string): Record<string, string> {
  return styles
    .split(';')
    .map((style) => {
      const separatorPosition = style.indexOf(':');
      const key = style
        .substring(0, separatorPosition)
        .trim()
        .replace(/-./g, (c) => c.substring(1).toUpperCase());
      const value = style.substring(separatorPosition + 1).trim();
      if (!key) return null;
      return [key, value];
    })
    .filter(Boolean)
    .reduce(
      (styleObj, style) => ({
        ...styleObj,
        ...(style ? { [style[0]]: style[1] } : {}),
      }),
      {} as Record<string, string>
    );
}

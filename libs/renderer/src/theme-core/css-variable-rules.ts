import type { CssVarDefinition } from '@qspider/game-state';
import { cleanPath, convertColor, getContrastColor, invertColor, isExternalUrl } from '@qspider/utils';

export function cssVariableRules(definition: CssVarDefinition, value: string): string[] {
  const rules: string[] = [];
  if (definition.type === 'color') {
    const preparedValue = value ? convertColor(Number(value)) : definition.defaultValue;
    if (preparedValue) {
      rules.push(`${definition.name}: ${preparedValue}`);
      if (definition.withContrast) {
        rules.push(`${definition.name}-contrast: ${getContrastColor(preparedValue)}`);
      }
      if (definition.withInverted) {
        const inverted = invertColor(preparedValue);
        rules.push(`${definition.name}-inverted: ${inverted}`);
        if (definition.withContrast) {
          rules.push(`${definition.name}-inverted-contrast: ${getContrastColor(inverted)}`);
        }
      }
    }
  } else if (definition.type === 'unit') {
    const unitValue = value || definition.defaultValue;
    if (unitValue) rules.push(`${definition.name}: ${unitValue}${definition.unit || ''}`);
  } else if (definition.type === 'resource') {
    return rules;
  } else if (value) {
    rules.push(`${definition.name}: ${value}`);
  }
  return rules;
}

export function resolveThemeUrl(url: string, baseUrl: string, initialBaseUrl: string): string {
  if (url.startsWith('qspider:')) {
    url = url.replace('qspider:', initialBaseUrl);
  } else if (isExternalUrl(url)) {
    return url;
  } else {
    url = baseUrl + url;
  }
  return cleanPath(url);
}

export function resourceVariableCss(name: string, url: string, size: { width: number; height: number } | null): string {
  const sizeDefinitions = size ? `${name}-w: ${size.width}px; ${name}-h: ${size.height}px` : '';
  return `qsp-game-root, #portal-container {${name}: ${url ? `url("${url}")` : 'none'};${sizeDefinitions}}`;
}

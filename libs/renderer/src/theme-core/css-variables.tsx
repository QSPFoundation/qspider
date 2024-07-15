import { CssVarDefinition, baseUrl$, currentCssVariables$, initialBaseUrl$, useQspVariable } from '@qspider/game-state';
import { convertColor, getContrastColor, invertColor } from '@qspider/utils';
import { useAtom, useSetup } from '@xoid/react';
import { atom } from 'xoid';

export const QspCSSVariables: React.FC = () => {
  const variables = useAtom(currentCssVariables$);
  return (
    <>
      {variables.map((definition) => (
        <QspCssVariable key={definition.name} definition={definition} />
      ))}
    </>
  );
};
interface ImageSize {
  width: number;
  height: number;
}

const imageSizes$ = atom<{ [key: string]: ImageSize }>({});

const QspCssVariableResource: React.FC<{ name: string; url: string; withSize: boolean }> = (props) => {
  const size$ = useSetup((props$) => {
    const url$ = props$.focus((s) => s.url);
    url$.watch((url) => {
      url = prepareUrl(url);
      if (!url) return;
      if (!imageSizes$.value[url]) {
        const img = document.createElement('img');
        img.onload = (): void => {
          const size = {
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          imageSizes$.update((s) => ({ ...s, [url]: size }));
        };
        img.src = url;
      }
    });
    return atom((get) => {
      const url = prepareUrl(get(url$));
      return get(imageSizes$)[url] ?? { width: 0, height: 0 };
    });
  }, props);
  const size = useAtom(size$);
  let { url } = props;
  url = prepareUrl(url);
  const { name } = props;

  const sizeDefinitions = props.withSize ? `${name}-w: ${size.width}px; ${name}-h: ${size.height}px` : '';
  const content = `qsp-game-root, #portal-container {${name}: ${url ? `url("${url}")` : 'none'};${sizeDefinitions}}`;
  return <style>{content}</style>;
};

function prepareUrl(url: string): string {
  if (url.startsWith('qspider:')) {
    url = url.replace('qspider:', initialBaseUrl$.value);
  } else {
    url = baseUrl$.value + url;
  }
  return url.replace('\\', '/');
}

export const QspCssVariable: React.FC<{ definition: CssVarDefinition }> = ({ definition }) => {
  const value = useQspVariable(definition.from, '', 0, '');
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
    const preparedValue = `${value || definition.defaultValue}${definition.unit || ''}`;
    rules.push(`${definition.name}: ${preparedValue}`);
  } else if (definition.type === 'resource') {
    if (!value && !definition.defaultValue) return null;
    return (
      <QspCssVariableResource
        name={definition.name}
        url={value || definition.defaultValue}
        withSize={definition.withSize}
      />
    );
  } else if (value) {
    rules.push(`${definition.name}: ${value}`);
  }
  if (!rules.length) return null;
  const content = `qsp-game-root, #portal-container {${rules.join('; ')}}`;
  return <style>{content}</style>;
};

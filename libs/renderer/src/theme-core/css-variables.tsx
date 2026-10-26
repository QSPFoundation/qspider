import { CssVarDefinition, baseUrl$, currentCssVariables$, initialBaseUrl$, useQspVariable } from '@qspider/game-state';
import { useAtom, useSetup } from '@xoid/react';
import { atom } from 'xoid';
import { cssVariableRules, resolveThemeUrl, resourceVariableCss } from './css-variable-rules';

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

  const content = resourceVariableCss(name, url, props.withSize ? size : null);
  return <style>{content}</style>;
};

function prepareUrl(url: string): string {
  return resolveThemeUrl(url, baseUrl$.value, initialBaseUrl$.value);
}

export const QspCssVariable: React.FC<{ definition: CssVarDefinition }> = ({ definition }) => {
  const value = useQspVariable(definition.from, '', 0, '');
  if (definition.type === 'resource') {
    if (!value && !definition.defaultValue) return null;
    return (
      <QspCssVariableResource
        name={definition.name}
        url={value || definition.defaultValue}
        withSize={definition.withSize}
      />
    );
  }
  const rules = cssVariableRules(definition, value);
  if (!rules.length) return null;
  const content = `qsp-game-root, #portal-container {${rules.join('; ')}}`;
  return <style>{content}</style>;
};

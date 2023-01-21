import { CssVarDefinition, currentCssVariables$, getResource, useQspVariable } from '@qspider/game-state';
import { convertColor, getContrastColor, invertColor } from '@qspider/utils';
import { useAtom } from '@xoid/react';
import { useImageSize } from '../hooks/image-size';

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

const QspCssVariableResource: React.FC<{ name: string; url: string; withSize: boolean }> = ({
  name,
  url,
  withSize,
}) => {
  const size = useImageSize(url);
  const sizeDefinitions = withSize ? `${name}-w: ${size.width}px; ${name}-h: ${size.height}px` : '';
  const content = `qsp-game-root, #portal-container {${name}: ${url ? `url(${url})` : 'none'};${sizeDefinitions}}`;
  return <style>{content}</style>;
};

export const QspCssVariable: React.FC<{ definition: CssVarDefinition }> = ({ definition }) => {
  const value = useQspVariable(definition.from, '', 0, '');
  const rules: string[] = [];
  if (definition.type === 'color') {
    const preparedValue = value ? convertColor(Number(value), true) : definition.defaultValue;
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
    if (!value) return null;
    return (
      <QspCssVariableResource name={definition.name} url={getResource(value).url} withSize={definition.withSize} />
    );
  }
  if (!rules.length) return null;
  const content = `qsp-game-root, #portal-container {${rules.join('; ')}}`;
  return <style>{content}</style>;
};

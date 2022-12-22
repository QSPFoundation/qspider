import { CssVarDefinition, currentCssVariables$, getResource, useQspVariable } from '@qspider/game-state';
import { convertColor } from '@qspider/utils';
import { useAtom } from '@xoid/react';
import Color from 'color';
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
  const content = `qsp-game-root {${name}: ${url ? `url(${url})` : 'none'};${sizeDefinitions}}`;
  return <style>{content}</style>;
};

export const QspCssVariable: React.FC<{ definition: CssVarDefinition }> = ({ definition }) => {
  const value = useQspVariable(definition.from, '', 0, '') || definition.defaultValue;
  let preparedValue: string | null = value;
  if (definition.type === 'color') {
    preparedValue = convertColor(value as unknown as number, true);
    if (preparedValue && definition.invert) {
      preparedValue = Color(preparedValue).negate().hex();
    }
  } else if (definition.type === 'unit' && value) {
    preparedValue = `${value}${definition.unit || ''}`;
  } else if (definition.type === 'resource') {
    if (!value) return null;
    return (
      <QspCssVariableResource name={definition.name} url={getResource(value).url} withSize={definition.withSize} />
    );
  }
  if (!preparedValue) return null;
  const content = `qsp-game-root {${definition.name}: ${preparedValue};}`;
  return <style>{content}</style>;
};

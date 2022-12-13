import { CssVarDefinition, currentCssVariables$, getResource, useQspVariable } from '@qspider/game-state';
import { convertColor } from '@qspider/utils';
import { useAtom } from '@xoid/react';
import Color from 'color';

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

export const QspCssVariable: React.FC<{ definition: CssVarDefinition }> = ({ definition }) => {
  const value = useQspVariable(definition.from, '', 0, '') || definition.defaultValue;
  let preparedValue = value || 'none';
  if (definition.type === 'color') {
    preparedValue = convertColor(value as unknown as number, true) || 'transparent';
    if (definition.invert) {
      preparedValue = Color(preparedValue).negate().hex();
    }
  } else if (definition.type === 'unit') {
    preparedValue = `${value}${definition.unit || ''}`;
  } else if (definition.type === 'resource') {
    const url = value && getResource(value).url;
    preparedValue = url ? `url(${url})` : 'none';
  }
  const content = `qsp-game-root {${definition.name}: ${preparedValue};}`;
  return <style>{content}</style>;
};

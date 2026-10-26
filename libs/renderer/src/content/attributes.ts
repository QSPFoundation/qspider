import { Attributes, GameCommand, QspSaveCommand, execCode, onGameCommand, onSaveCommand } from '@qspider/game-state';
import { convertAttributes } from './convert-attributes';
import { getSaveContext } from './save-context';

export const useAttributes = <Tag extends keyof React.JSX.IntrinsicElements>(
  attributes: Attributes,
  tagName: Tag,
  dataName: string = tagName,
): [Tag, React.CSSProperties, Omit<Attributes, 'style'>] => {
  const { tag, style, props, events, command } = convertAttributes(attributes, tagName, dataName);
  const converted: Attributes = props as Attributes;
  for (const { prop, code } of events) {
    converted[prop] = (e: Event): void => {
      e.preventDefault();
      execCode(code);
    };
  }
  if (command?.kind === 'game') {
    converted['onClick'] = (e: MouseEvent): void => {
      e.preventDefault();
      onGameCommand(command.value as GameCommand);
    };
  } else if (command?.kind === 'save') {
    converted['onClick'] = (e: MouseEvent): void => {
      e.preventDefault();
      if (!e.target) return;
      const context = getSaveContext(e.target as HTMLElement);
      if (!context) return;
      onSaveCommand(command.value as QspSaveCommand, context);
    };
  }
  return [tag as Tag, style, converted];
};

import { Attributes, GameCommand, QspSaveCommand, execCode, onGameCommand, onSaveCommand } from '@qspider/game-state';
import { ConvertedAttributes, convertAttributes } from './convert-attributes';
import { getSaveContext } from './save-context';

/**
 * Binds the converted events and commands to handlers. A dropped tag comes back as an inert span: a component
 * cannot skip its own wrapper, so it renders that instead (Element checks `dropped` and renders nothing).
 */
export const bindAttributes = <Tag extends keyof React.JSX.IntrinsicElements>({
  tag,
  dropped,
  style,
  props,
  events,
  command,
}: ConvertedAttributes): [Tag, React.CSSProperties, Omit<Attributes, 'style'>] => {
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
  return [(dropped ? 'span' : tag) as Tag, style, converted];
};

export const useAttributes = <Tag extends keyof React.JSX.IntrinsicElements>(
  attributes: Attributes,
  tagName: Tag,
  dataName: string = tagName,
): [Tag, React.CSSProperties, Omit<Attributes, 'style'>] =>
  bindAttributes<Tag>(convertAttributes(attributes, tagName, dataName));

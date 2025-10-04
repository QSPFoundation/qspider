export interface FormattedArg {
  name: string;
  value: string;
}

// Event signatures for better argument presentation
export const EVENT_SIGNATURES: Record<string, string[]> = {
  main_changed: ['text', 'isNewDesc'],
  stats_changed: ['text'],
  actions_changed: ['actions'],
  objects_changed: ['objects'],
  panel_visibility: ['type', 'isShown'],
  user_input: ['text'],
  error: ['errorData'],
  menu: ['items'],
  msg: ['text'],
  input: ['text'],
  version: ['type'],
  wait: ['ms'],
  timer: ['ms'],
  view: ['path'],
  open_game: ['path', 'isNewGame'],
  save_game: ['path'],
  load_save: ['path'],
  is_play: ['file'],
  play_file: ['path', 'volume'],
  close_file: ['path'],
  system_cmd: ['cmd'],
  debug: ['record'],
};

// QSP Panel types for bitmask decoding
export const QSP_PANEL_NAMES: Record<number, string> = {
  1: 'MAIN', // QspPanel.MAIN
  2: 'VARS', // QspPanel.VARS
  4: 'ACTS', // QspPanel.ACTS
  8: 'OBJS', // QspPanel.OBJS
  16: 'INPUT', // QspPanel.INPUT
  32: 'VIEW', // QspPanel.VIEW
};

export function decodePanelBitmask(bitmask: number): string {
  const panels: string[] = [];

  for (const [bit, name] of Object.entries(QSP_PANEL_NAMES)) {
    const bitValue = parseInt(bit, 10);
    if (bitmask & bitValue) {
      panels.push(name);
    }
  }

  return panels.length > 0 ? panels.join(' | ') : `Unknown(${bitmask})`;
}

export function formatListItems(items: unknown[]): string {
  if (!Array.isArray(items) || items.length === 0) {
    return '[]';
  }

  const formattedItems = items.map((item, index) => {
    if (item && typeof item === 'object' && 'name' in item) {
      const listItem = item as { name: string; image?: string; title?: string };
      let itemStr = `"${listItem.name}"`;

      // Add title for objects if present
      if ('title' in listItem && listItem.title && listItem.title !== listItem.name) {
        itemStr += ` (${listItem.title})`;
      }

      // Add image info if present and not empty
      if (listItem.image) {
        itemStr += ` [img: ${listItem.image}]`;
      }

      return `  ${index}: ${itemStr}`;
    }
    return `  ${index}: ${JSON.stringify(item)}`;
  });

  return `[\n${formattedItems.join(',\n')}\n]`;
}

export function formatEventArgs(eventName: string, args: unknown[]): FormattedArg[] {
  const signature = EVENT_SIGNATURES[eventName] || [];

  return args.map((arg, index) => {
    const paramName = signature[index] || `arg${index}`;
    let value: string;

    // Special handling for panel_visibility event's type parameter
    if (eventName === 'panel_visibility' && paramName === 'type' && typeof arg === 'number') {
      value = decodePanelBitmask(arg);
    }
    // Special handling for actions_changed and objects_changed arrays
    else if (
      (eventName === 'actions_changed' && paramName === 'actions') ||
      (eventName === 'objects_changed' && paramName === 'objects')
    ) {
      value = Array.isArray(arg) ? formatListItems(arg) : String(arg);
    }
    // Special handling for menu items array
    else if (eventName === 'menu' && paramName === 'items') {
      value = Array.isArray(arg) ? formatListItems(arg) : String(arg);
    } else if (typeof arg === 'function') {
      value = '[Function]';
    } else if (typeof arg === 'string') {
      value = `"${arg}"`;
    } else if (typeof arg === 'boolean') {
      value = String(arg);
    } else if (typeof arg === 'number') {
      value = String(arg);
    } else if (arg === null) {
      value = 'null';
    } else if (arg === undefined) {
      value = 'undefined';
    } else if (Array.isArray(arg)) {
      value = `[${arg.length} items]`;
    } else if (arg && typeof arg === 'object') {
      try {
        value = JSON.stringify(arg);
      } catch {
        value = '[Complex Object]';
      }
    } else {
      value = String(arg);
    }

    return {
      name: paramName,
      value,
    };
  });
}

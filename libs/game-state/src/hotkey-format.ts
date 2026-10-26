// The pure parts of hotkeys.ts: how hotkeys are written for the pause screen, which dialogs block the
// Restart hotkey and Escape, and what the space, restart and save hotkeys decide. Light: no Mousetrap, no engine.

export type PrettyHotkeys =
  | {
      type: 'key';
      symbol: string;
    }
  | {
      type: 'separator';
      symbol: string;
    };

const prettySymbolsCommon: Record<string, string> = {
  backspace: 'BackSpace',
  tab: 'Tab',
  enter: '↵ Enter',
  capslock: 'CapsLock',
  space: 'Space',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  end: 'End',
  home: 'Home',
  left: '←',
  up: '↑',
  right: '→',
  down: '↓',
  ins: 'Insert',
  del: 'Delete',
  plus: '+',
  f12: 'F12',
  shift: 'Shift',
  ctrl: 'Ctrl',
  alt: 'Alt',
  mod: 'Ctrl',
};

const prettySymbolsMacOs: Record<string, string> = {
  shift: '⇧',
  ctrl: '⌃',
  alt: '⌥',
  mod: '⌘',
};

const isOwn = (table: Record<string, string>, name: string): boolean =>
  Object.prototype.hasOwnProperty.call(table, name);

/** `platform` is the window manager's platform name: 'Macintosh' gets the Mac modifier symbols. */
export function prettifyHotkeys(keys: string, platform: string): PrettyHotkeys[] {
  const prettified: PrettyHotkeys[] = [];
  const spaced = keys.split(' ');
  for (let i = 0; i < spaced.length; i++) {
    const plused = spaced[i].split('+');
    for (let j = 0; j < plused.length; j++) {
      let symbol = plused[j];
      if (isOwn(prettySymbolsCommon, symbol)) {
        symbol = prettySymbolsCommon[symbol];
      }
      if (platform === 'Macintosh' && isOwn(prettySymbolsMacOs, plused[j])) {
        symbol = prettySymbolsMacOs[plused[j]];
      }
      prettified.push({
        type: 'key',
        symbol,
      });
      if (j < plused.length - 1) {
        prettified.push({ type: 'separator', symbol: '+' });
      }
    }
    if (i < spaced.length - 1) {
      prettified.push({ type: 'separator', symbol: ' ' });
    }
  }
  return prettified;
}

export interface DialogState {
  msg: boolean;
  input: boolean;
  menu: boolean;
  wait: boolean;
  view: { isOpen: boolean; isModal: boolean };
}

/** A msg, input, menu, wait or modal view is open: shared by the Restart hotkey and the Escape handler (game-runner.tsx). */
export function isBlockingDialogOpen(state: DialogState): boolean {
  return state.msg || state.input || state.menu || state.wait || (state.view.isOpen && state.view.isModal);
}

export interface HotkeyContext {
  isPaused: boolean;
  actionCount: number;
  dialogs: DialogState;
  /** The game's NOSAVE variable is set. */
  nosave: boolean;
}

export interface HotkeyDecision {
  /** Mousetrap gets `false` back, so the browser's own action for the key does not run. */
  preventDefault: boolean;
  /** What the player should do for the key, if anything. */
  run: 'exec-single-action' | 'restart' | 'save' | null;
}

export function resolveHotkey(hotkey: 'space' | 'restart' | 'save', context: HotkeyContext): HotkeyDecision {
  switch (hotkey) {
    case 'space':
      if (context.isPaused) return { preventDefault: false, run: null };
      return { preventDefault: true, run: context.actionCount === 1 ? 'exec-single-action' : null };
    case 'restart':
      // Ignored (but still kept from the browser's reload) while the engine waits on a dialog: restarting
      // under it would leave the engine inside the old call, with the restarted game stuck.
      return { preventDefault: true, run: isBlockingDialogOpen(context.dialogs) ? null : 'restart' };
    case 'save':
      // The browser's "Save page" dialog must not open over a game that forbids saving.
      if (context.nosave) return { preventDefault: true, run: null };
      return { preventDefault: true, run: 'save' };
  }
}

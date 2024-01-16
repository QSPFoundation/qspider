import Mousetrap from 'mousetrap';
import { volume$ } from './audio';
import { isPaused$ } from './counter';
import { GameCommand, onGameCommand } from './current-game';
import { actions$, execSelectedAction, selectAction } from './panels';
import { qspApi$ } from './qsp-api';
import { requestedAction$ } from './save';
import create from 'xoid';
import { windowManager$ } from './window-manager';

interface GlobalHotKey {
  keys: string;
  description: string;
  when_paused: boolean;
  on_press:
    | { type: 'game_action'; action: GameCommand }
    | { type: 'action'; index: number }
    | ((e: Mousetrap.ExtendedKeyboardEvent, combo: string) => void | boolean);
}

export type PrettyHotkeys =
  | {
      type: 'key';
      symbol: string;
    }
  | {
      type: 'separator';
      symbol: string;
    };

export const globalHotKeys$ = create<GlobalHotKey[]>([
  { when_paused: false, description: 'Action #1', keys: '1', on_press: { type: 'action', index: 0 } },
  { when_paused: false, description: 'Action #2', keys: '2', on_press: { type: 'action', index: 1 } },
  { when_paused: false, description: 'Action #3', keys: '3', on_press: { type: 'action', index: 2 } },
  { when_paused: false, description: 'Action #4', keys: '4', on_press: { type: 'action', index: 3 } },
  { when_paused: false, description: 'Action #5', keys: '5', on_press: { type: 'action', index: 4 } },
  { when_paused: false, description: 'Action #6', keys: '6', on_press: { type: 'action', index: 5 } },
  { when_paused: false, description: 'Action #7', keys: '7', on_press: { type: 'action', index: 6 } },
  { when_paused: false, description: 'Action #8', keys: '8', on_press: { type: 'action', index: 7 } },
  { when_paused: false, description: 'Action #9', keys: '9', on_press: { type: 'action', index: 8 } },
  {
    when_paused: false,
    keys: 'space',
    description: 'Single action',
    on_press: (): void | boolean => {
      if (isPaused$.value) return;
      const actions = actions$.value;
      if (actions.length === 1) {
        selectAction(0);
        execSelectedAction();
      }
      return false;
    },
  },
  { when_paused: true, description: 'Restart', keys: 'mod+r', on_press: { type: 'game_action', action: 'restart' } },
  { when_paused: false, description: 'Quicksave', keys: 'f5', on_press: { type: 'game_action', action: 'quicksave' } },
  { when_paused: false, description: 'Quickload', keys: 'f9', on_press: { type: 'game_action', action: 'quickload' } },
  {
    when_paused: false,
    keys: 'mod+s',
    description: 'Save',
    on_press: (): boolean | undefined => {
      requestedAction$.set('save');
      onGameCommand('pause:saves' as GameCommand);
      return false;
    },
  },
  {
    when_paused: false,
    keys: 'mod+o',
    description: 'Load',
    on_press: (): boolean | undefined => {
      requestedAction$.set('load');
      onGameCommand('pause:saves' as GameCommand);
      return false;
    },
  },
  {
    when_paused: true,
    keys: 'pageup',
    description: 'Increase volume',
    on_press: (): boolean => {
      volume$.actions.increase();
      return false;
    },
  },
  {
    when_paused: true,
    keys: 'pagedown',
    description: 'Decrease volume',
    on_press: (): boolean => {
      volume$.actions.decrease();
      return false;
    },
  },
  { when_paused: true, description: 'Mute', keys: 'home', on_press: { type: 'game_action', action: 'mute' } },
  { when_paused: true, description: 'Unmute', keys: 'end', on_press: { type: 'game_action', action: 'unmute' } },
]);

export function setupGlobalHotKeys(): void {
  for (const hotkey of globalHotKeys$.value) {
    Mousetrap.bind([hotkey.keys], (e, code) => {
      if (!hotkey.when_paused && isPaused$.value) return;
      if (typeof hotkey.on_press === 'function') {
        return hotkey.on_press(e, code);
      } else if (hotkey.on_press.type === 'action') {
        selectAction(hotkey.on_press.index);
        execSelectedAction();
        return false;
      } else if (hotkey.on_press.type === 'game_action') {
        onGameCommand(hotkey.on_press.action);
        return false;
      }
    });
  }
}

export function setupCustomHotKeys(map: Record<string, string>): void {
  for (const [key, value] of Object.entries(map)) {
    Mousetrap.bind(key, () => {
      if (isPaused$.value) return;
      qspApi$.value?.execLoc(value);
      return false;
    });
  }
}

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

export function prettifyHotkeys(keys: string): PrettyHotkeys[] {
  const prettified: PrettyHotkeys[] = [];
  const spaced = keys.split(' ');
  for (let i = 0; i < spaced.length; i++) {
    const plused = spaced[i].split('+');
    for (let j = 0; j < plused.length; j++) {
      let symbol = plused[j];
      if (symbol in prettySymbolsCommon) {
        symbol = prettySymbolsCommon[symbol];
      }
      if (windowManager$.value?.platform === 'Macintosh' && plused[j] in prettySymbolsMacOs) {
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

export function clearHotkeys(): void {
  Mousetrap.reset();
}

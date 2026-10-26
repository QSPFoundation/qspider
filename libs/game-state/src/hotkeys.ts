import Mousetrap from 'mousetrap';
import { volume$ } from './audio';
import { isPaused$ } from './counter';
import { GameCommand, onGameCommand, requestSavesPanel } from './current-game';
import { actions$, canSelectAction, runAction, view$ } from './panels';
import { input$ } from './input';
import { menu$ } from './menu';
import { msg$ } from './msg';
import { wait$ } from './wait';
import { qspApi$ } from './qsp-api';
import create from 'xoid';
import { isBlockingDialogOpen, resolveHotkey, type DialogState, type HotkeyDecision } from './hotkey-format';

function dialogState(): DialogState {
  return {
    msg: msg$.value.isOpen,
    input: input$.value.isOpen,
    menu: menu$.value.isOpen,
    wait: Boolean(wait$.value),
    view: { isOpen: view$.value.isOpen, isModal: view$.value.isModal },
  };
}

/** Whether a msg, input, menu, wait or modal view is open (the Escape handler in game-runner.tsx asks). */
export function isDialogBlocking(): boolean {
  return isBlockingDialogOpen(dialogState());
}

function decide(hotkey: 'space' | 'restart' | 'save'): HotkeyDecision {
  return resolveHotkey(hotkey, {
    isPaused: isPaused$.value,
    actionCount: actions$.value.length,
    dialogs: dialogState(),
    nosave: hotkey === 'save' && Boolean(qspApi$.value?.readVariable('NOSAVE')),
  });
}

interface GlobalHotKey {
  keys: string;
  description: string;
  when_paused: boolean;
  on_press:
    | { type: 'game_action'; action: GameCommand }
    | { type: 'action'; index: number }
    | ((e: Mousetrap.ExtendedKeyboardEvent, combo: string) => void | boolean);
}

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
      const decision = decide('space');
      if (decision.run === 'exec-single-action') {
        runAction(0);
      }
      return decision.preventDefault ? false : undefined;
    },
  },
  {
    when_paused: true,
    keys: 'mod+r',
    description: 'Restart',
    on_press: (): boolean => {
      if (decide('restart').run === 'restart') onGameCommand('restart');
      return false;
    },
  },
  { when_paused: false, description: 'Quicksave', keys: 'f5', on_press: { type: 'game_action', action: 'quicksave' } },
  { when_paused: false, description: 'Quickload', keys: 'f9', on_press: { type: 'game_action', action: 'quickload' } },
  {
    when_paused: false,
    keys: 'mod+s',
    description: 'Save',
    on_press: (): boolean | undefined => {
      const decision = decide('save');
      if (decision.run === 'save') {
        requestSavesPanel('save');
      }
      return decision.preventDefault ? false : undefined;
    },
  },
  {
    when_paused: false,
    keys: 'mod+o',
    description: 'Load',
    on_press: (): boolean | undefined => {
      requestSavesPanel('load');
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
  {
    when_paused: false,
    keys: 'f12',
    description: 'Open QSP Debugger (F12)',
    on_press: (): boolean => {
      // Debug functionality is handled in DebugButton component
      return true; // Don't prevent default, let other handlers process F12
    },
  },
]);

export function setupGlobalHotKeys(): void {
  for (const hotkey of globalHotKeys$.value) {
    Mousetrap.bind([hotkey.keys], (e, code) => {
      if (!hotkey.when_paused && isPaused$.value) return;
      if (typeof hotkey.on_press === 'function') {
        return hotkey.on_press(e, code);
      } else if (hotkey.on_press.type === 'action') {
        if (canSelectAction(hotkey.on_press.index)) {
          runAction(hotkey.on_press.index);
          return false;
        }
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

export function clearHotkeys(): void {
  Mousetrap.reset();
}

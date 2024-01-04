import Mousetrap from 'mousetrap';
import { volume$ } from './audio';
import { isPaused$ } from './counter';
import { GameAction, onGameAction } from './current-game';
import { actions$, execSelectedAction, selectAction } from './panels';
import { qspApi$ } from './qsp-api';
import { requestedAction$ } from './save';
import create from 'xoid';

interface GlobalHotKey {
  keys: string;
  description: string;
  when_paused: boolean;
  on_press:
    | { type: 'game_action'; action: GameAction }
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
      onGameAction('pause:saves' as GameAction);
      return false;
    },
  },
  {
    when_paused: false,
    keys: 'mod+o',
    description: 'Load',
    on_press: (): boolean | undefined => {
      requestedAction$.set('load');
      onGameAction('pause:saves' as GameAction);
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
        onGameAction(hotkey.on_press.action);
        return false;
      }
    });
  }
}

export function setupCustomHotKeys(map: Record<string, string>): void {
  for (const [key, value] of Object.entries(map)) {
    Mousetrap.bind(key, () => {
      qspApi$.value?.execLoc(value);
      return false;
    });
  }
}

export function clearHotkeys(): void {
  Mousetrap.reset();
}

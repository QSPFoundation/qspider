import Mousetrap from 'mousetrap';
import { volume$ } from './audio';
import { isPaused$ } from './counter';
import { onGameAction } from './current-game';
import { actions$, execSelectedAction, selectAction } from './panels';
import { qspApi$ } from './qsp-api';

export function setupGlobalHotKeys(): void {
  Mousetrap.bind(['1', '2', '3', '4', '5', '6', '7', '8', '9'], (_, code) => {
    if (isPaused$.value) return;
    const index = parseInt(code, 10) - 1;
    selectAction(index);
    execSelectedAction();
    return false;
  });
  Mousetrap.bind(['space'], () => {
    if (isPaused$.value) return;
    const actions = actions$.value;
    if (actions.length === 1) {
      selectAction(0);
      execSelectedAction();
    }
  });
  Mousetrap.bind(['mod+s'], () => {
    if (isPaused$.value) return;
    onGameAction('save');
    return false;
  });
  Mousetrap.bind(['mod+o'], () => {
    if (isPaused$.value) return;
    onGameAction('load');
    return false;
  });
  Mousetrap.bind(['mod+r'], () => {
    if (isPaused$.value) return;
    onGameAction('restart');
    return false;
  });
  Mousetrap.bind(['f5'], () => {
    if (isPaused$.value) return;
    onGameAction('quicksave');
    return false;
  });
  Mousetrap.bind(['f9'], () => {
    if (isPaused$.value) return;
    onGameAction('quickload');
    return false;
  });
  Mousetrap.bind(['pageup'], () => {
    volume$.actions.increase();
    return false;
  });
  Mousetrap.bind(['pagedown'], () => {
    volume$.actions.decrease();
    return false;
  });
  Mousetrap.bind(['home'], () => {
    onGameAction('mute');
    return false;
  });
  Mousetrap.bind(['end'], () => {
    onGameAction('unmute');
    return false;
  });
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

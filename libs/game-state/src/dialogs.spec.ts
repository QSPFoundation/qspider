import { beforeEach, describe, expect, it } from 'vitest';
import type { QspListItem } from '@qsp/wasm-engine';
import { isPaused$, resetCounterPauses } from './counter-pauses';
import { clearDialogs } from './dialogs';
import { input$ } from './input';
import { menu$ } from './menu';
import { msg$ } from './msg';

isPaused$.subscribe(() => undefined);

const ITEMS: QspListItem[] = [{ name: 'First item', image: '' }];
const CLOSED_INPUT = { isOpen: false, content: '', entered: '', onfinished: null };
const CLOSED_MENU = { isOpen: false, items: [], onselect: null };
const CLOSED_MSG = { isOpen: false, content: '', onclosed: null };

const initial = { input: input$.value, menu: menu$.value, msg: msg$.value };

beforeEach(() => {
  input$.set(initial.input);
  menu$.set(initial.menu);
  msg$.set(initial.msg);
  resetCounterPauses();
});

describe('clearDialogs', () => {
  it('cancels every open dialog', () => {
    const answers: string[] = [];
    input$.actions.open('DIALOG PROMPT', (result) => answers.push(`input:${result}`));
    msg$.actions.open('DIALOG MESSAGE', () => answers.push('msg'));
    clearDialogs();
    expect(answers).toEqual(['input:', 'msg']);
    expect(input$.value).toEqual(CLOSED_INPUT);
    expect(msg$.value).toEqual(CLOSED_MSG);
    expect(isPaused$.value).toBe(false);
  });

  it('discards a menu that a message callback opens after the menu was cleared', () => {
    let menuAnswered = false;
    msg$.actions.open('DIALOG MESSAGE', () =>
      menu$.actions.open(ITEMS, () => {
        menuAnswered = true;
      }),
    );
    clearDialogs();
    expect(menu$.value).toEqual(CLOSED_MENU);
    expect(isPaused$.value).toBe(false);
    menu$.actions.select(0);
    expect(menuAnswered).toBe(false);
  });

  it('discards a prompt that a menu callback opens after the prompt was cleared', () => {
    menu$.actions.open(ITEMS, () => input$.actions.open('NEXT PROMPT', () => undefined));
    clearDialogs();
    expect(input$.value).toEqual(CLOSED_INPUT);
    expect(isPaused$.value).toBe(false);
  });
});

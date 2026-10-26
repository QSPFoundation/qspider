import { describe, expect, it } from 'vitest';
import { isBlockingDialogOpen, prettifyHotkeys, resolveHotkey, type DialogState } from './hotkey-format';

const key = (symbol: string): { type: 'key'; symbol: string } => ({ type: 'key', symbol });
const separator = (symbol: string): { type: 'separator'; symbol: string } => ({ type: 'separator', symbol });

const NO_DIALOGS: DialogState = {
  msg: false,
  input: false,
  menu: false,
  wait: false,
  view: { isOpen: false, isModal: false },
};

describe('prettifyHotkeys', () => {
  it('writes mod as Ctrl outside macOS', () => {
    expect(prettifyHotkeys('mod+s', 'Windows')).toEqual([key('Ctrl'), separator('+'), key('s')]);
  });

  it('writes the modifiers as symbols on macOS', () => {
    expect(prettifyHotkeys('mod+shift+alt+ctrl+s', 'Macintosh')).toEqual([
      key('⌘'),
      separator('+'),
      key('⇧'),
      separator('+'),
      key('⌥'),
      separator('+'),
      key('⌃'),
      separator('+'),
      key('s'),
    ]);
  });

  it('keeps the common names on macOS for keys that are not modifiers', () => {
    expect(prettifyHotkeys('pageup', 'Macintosh')).toEqual([key('PageUp')]);
  });

  it('separates alternatives written with a space', () => {
    expect(prettifyHotkeys('f5 f9', 'Linux')).toEqual([key('f5'), separator(' '), key('f9')]);
  });

  it('writes ctrl++ as Ctrl, a separator and an empty key', () => {
    expect(prettifyHotkeys('ctrl++', 'Linux')).toEqual([key('Ctrl'), separator('+'), key(''), separator('+'), key('')]);
  });

  it('writes the plus key named plus', () => {
    expect(prettifyHotkeys('ctrl+plus', 'Linux')).toEqual([key('Ctrl'), separator('+'), key('+')]);
  });

  it('does not look up prototype keys', () => {
    expect(prettifyHotkeys('constructor', 'Linux')).toEqual([key('constructor')]);
    expect(prettifyHotkeys('toString', 'Macintosh')).toEqual([key('toString')]);
  });
});

describe('isBlockingDialogOpen', () => {
  it('is false with nothing open', () => {
    expect(isBlockingDialogOpen(NO_DIALOGS)).toBe(false);
  });

  it.each(['msg', 'input', 'menu', 'wait'] as const)('is true while %s is open', (dialog) => {
    expect(isBlockingDialogOpen({ ...NO_DIALOGS, [dialog]: true })).toBe(true);
  });

  it('is true for a modal view', () => {
    expect(isBlockingDialogOpen({ ...NO_DIALOGS, view: { isOpen: true, isModal: true } })).toBe(true);
  });

  it('is false for a view that is not modal, or a modal view that is closed', () => {
    expect(isBlockingDialogOpen({ ...NO_DIALOGS, view: { isOpen: true, isModal: false } })).toBe(false);
    expect(isBlockingDialogOpen({ ...NO_DIALOGS, view: { isOpen: false, isModal: true } })).toBe(false);
  });
});

describe('resolveHotkey', () => {
  const context = { isPaused: false, actionCount: 1, dialogs: NO_DIALOGS, nosave: false };

  it('runs the only action on space', () => {
    expect(resolveHotkey('space', context)).toEqual({ preventDefault: true, run: 'exec-single-action' });
  });

  it('keeps space from the browser but runs nothing with several actions', () => {
    expect(resolveHotkey('space', { ...context, actionCount: 2 })).toEqual({ preventDefault: true, run: null });
    expect(resolveHotkey('space', { ...context, actionCount: 0 })).toEqual({ preventDefault: true, run: null });
  });

  it('leaves space alone while paused', () => {
    expect(resolveHotkey('space', { ...context, isPaused: true })).toEqual({ preventDefault: false, run: null });
  });

  it('restarts when no dialog is open', () => {
    expect(resolveHotkey('restart', context)).toEqual({ preventDefault: true, run: 'restart' });
  });

  it('blocks restart under a dialog but still keeps the browser from reloading', () => {
    expect(resolveHotkey('restart', { ...context, dialogs: { ...NO_DIALOGS, menu: true } })).toEqual({
      preventDefault: true,
      run: null,
    });
  });

  it('saves when the game allows it', () => {
    expect(resolveHotkey('save', context)).toEqual({ preventDefault: true, run: 'save' });
  });

  // D17: the browser's "Save page" dialog must not open over a game that forbids saving.
  it('keeps Ctrl+S from the browser with NOSAVE set, and saves nothing', () => {
    expect(resolveHotkey('save', { ...context, nosave: true })).toEqual({ preventDefault: true, run: null });
  });
});

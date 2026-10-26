import { describe, expect, it } from 'vitest';
import { getSaveContext } from './save-context';

function saveSlot(attrs: Record<string, string>): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-qsp-save', '');
  for (const [name, value] of Object.entries(attrs)) root.setAttribute(name, value);
  const button = document.createElement('button');
  root.appendChild(button);
  return button;
}

describe('getSaveContext', () => {
  it('reads slot index and path from the enclosing save element', () => {
    const button = saveSlot({ 'data-qsp-save-index': '3', 'data-qsp-save-path': 'p' });
    expect(getSaveContext(button)).toEqual({ slot_index: 3, save_path: 'p' });
  });

  it('uses slot index -1 when the save element has no index', () => {
    expect(getSaveContext(saveSlot({ 'data-qsp-save-path': 'p' }))).toEqual({ slot_index: -1, save_path: 'p' });
  });

  it('returns null outside any save element', () => {
    expect(getSaveContext(document.createElement('button'))).toBeNull();
  });
});

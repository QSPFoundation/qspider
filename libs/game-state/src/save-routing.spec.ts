import { beforeEach, describe, expect, it } from 'vitest';
import {
  cancelPendingSaveCallbacks,
  finishSave,
  gameSavedCallback$,
  requestedAction$,
  resumeAfterLoad,
  saveCommandTarget,
  saveLoadedCallback$,
} from './save-routing';

beforeEach(() => {
  saveLoadedCallback$.set(null);
  gameSavedCallback$.set(null);
  requestedAction$.set(null);
});

describe('saveCommandTarget', () => {
  it('goes to the slot when the slot index is above 0', () => {
    expect(saveCommandTarget({ slot_index: 3, save_path: '' })).toEqual({ slot: 3 });
  });

  it('prefers the slot to the path when both are given', () => {
    expect(saveCommandTarget({ slot_index: 1, save_path: 'saves/a.sav' })).toEqual({ slot: 1 });
  });

  it('goes to the path when the slot index is 0', () => {
    expect(saveCommandTarget({ slot_index: 0, save_path: 'saves/a.sav' })).toEqual({ path: 'saves/a.sav' });
  });

  it('goes nowhere with no slot and no path', () => {
    expect(saveCommandTarget({ slot_index: 0, save_path: '' })).toBeNull();
    expect(saveCommandTarget({ slot_index: -1, save_path: '' })).toBeNull();
  });
});

describe('finishSave', () => {
  it('answers the waiting SAVEGAME once and drops the request', () => {
    const calls: string[] = [];
    gameSavedCallback$.set(() => calls.push('saved'));
    requestedAction$.set('save');
    finishSave();
    finishSave();
    expect(calls).toEqual(['saved']);
    expect(gameSavedCallback$.value).toBeNull();
    expect(requestedAction$.value).toBeNull();
  });

  it('only drops the request when the engine waits on nothing', () => {
    requestedAction$.set('save');
    finishSave();
    expect(requestedAction$.value).toBeNull();
  });
});

describe('resumeAfterLoad', () => {
  it('answers the waiting OPENGAME once and drops the request', () => {
    const calls: string[] = [];
    saveLoadedCallback$.set(() => calls.push('loaded'));
    requestedAction$.set('load');
    resumeAfterLoad();
    resumeAfterLoad();
    expect(calls).toEqual(['loaded']);
    expect(saveLoadedCallback$.value).toBeNull();
    expect(requestedAction$.value).toBeNull();
  });

  it('clears the callback before it runs, so a load the callback starts keeps its own callback', () => {
    const seen: unknown[] = [];
    saveLoadedCallback$.set(() => seen.push(saveLoadedCallback$.value));
    resumeAfterLoad();
    expect(seen).toEqual([null]);
  });

  it('only drops the request when the engine waits on nothing', () => {
    requestedAction$.set('load');
    resumeAfterLoad();
    expect(requestedAction$.value).toBeNull();
  });
});

describe('cancelPendingSaveCallbacks', () => {
  it('answers both waiting callbacks and drops the request', () => {
    const calls: string[] = [];
    saveLoadedCallback$.set(() => calls.push('loaded'));
    gameSavedCallback$.set(() => calls.push('saved'));
    requestedAction$.set('load');
    cancelPendingSaveCallbacks();
    expect(calls).toEqual(['loaded', 'saved']);
    expect(saveLoadedCallback$.value).toBeNull();
    expect(gameSavedCallback$.value).toBeNull();
    expect(requestedAction$.value).toBeNull();
  });

  it('drops a request alone when nothing waits', () => {
    requestedAction$.set('save');
    cancelPendingSaveCallbacks();
    expect(requestedAction$.value).toBeNull();
  });
});

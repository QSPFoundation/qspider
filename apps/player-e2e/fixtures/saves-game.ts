// The saves fixture game (saves/saves.qsps, packed as ARCHIVES.savesZip): its path and the strings
// it writes. Keep this module free of test-framework imports: both runners load it.
import { ARCHIVES } from './archives';

export const SAVES_GAME = {
  path: ARCHIVES.savesZip.path,
  title: 'Saves game',
  text: {
    start: 'SAVES START',
    /** Shown in the room text once `nosave` is set. */
    nosaveOn: 'NOSAVE ON',
    counter: (n: number): string => `COUNTER=${n}`,
    /** Written by code that runs after `savegame` returned. */
    afterSavePanel: 'AFTER SAVE PANEL',
    /** Written by code that runs after `opengame` returned. */
    afterLoadPanel: 'AFTER LOAD PANEL',
    /** Shown in a msg box by code that runs after `opengame` returned. */
    afterLoadMsg: 'AFTER LOAD MSG',
  },
  /**
   * Action labels on the room location (goToRoom and goToMessageRoom are on the start location;
   * the message room has increment, save and loadThenMessage: the room's list already fills the
   * actions panel, and an action below the fold is not visible to the scenarios).
   */
  action: {
    goToRoom: 'Go to room',
    goToMessageRoom: 'Go to message room',
    increment: 'Increment',
    /** savegame / opengame without a path. */
    save: 'Save',
    load: 'Load',
    saveThenMark: 'Save then mark',
    loadThenMark: 'Load then mark',
    loadThenMessage: 'Load then message',
    /** savegame / opengame 'named.sav'. */
    saveNamed: 'Save named',
    loadNamed: 'Load named',
    enableNosave: 'Enable nosave',
  },
  namedSave: 'named.sav',
} as const;

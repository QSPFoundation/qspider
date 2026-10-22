// The saves fixture game (saves/saves.qsps, packed as ARCHIVES.savesZip): its path and the strings
// it writes. Keep this module free of test-framework imports: both runners load it.
import { ARCHIVES } from './archives';

export const SAVES_GAME = {
  path: ARCHIVES.savesZip.path,
  title: 'Saves game',
  text: {
    start: 'SAVES START',
    counter: (n: number): string => `COUNTER=${n}`,
    /** Written by code that runs after `savegame` returned. */
    afterSavePanel: 'AFTER SAVE PANEL',
    /** Written by code that runs after `opengame` returned. */
    afterLoadPanel: 'AFTER LOAD PANEL',
  },
  /** Action labels on the room location (goToRoom is on the start location). */
  action: {
    goToRoom: 'Go to room',
    increment: 'Increment',
    /** savegame / opengame without a path. */
    save: 'Save',
    load: 'Load',
    saveThenMark: 'Save then mark',
    loadThenMark: 'Load then mark',
    /** savegame / opengame 'named.sav'. */
    saveNamed: 'Save named',
    loadNamed: 'Load named',
    enableNosave: 'Enable nosave',
  },
  namedSave: 'named.sav',
} as const;

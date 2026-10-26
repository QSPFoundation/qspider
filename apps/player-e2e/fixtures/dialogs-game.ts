// The dialogs fixture game (dialogs/dialogs.qsps, packed as ARCHIVES.dialogsZip): its path and
// the strings it writes. Keep this module free of test-framework imports: both runners load it.
import { fileURLToPath } from 'node:url';

export const DIALOGS = {
  path: fileURLToPath(new URL('../artifacts/fixtures/dialogs.zip', import.meta.url)),
  title: 'Dialogs game',
  /** Action labels on the start location. */
  actions: {
    message: 'Show message',
    input: 'Ask input',
    menu: 'Open menu',
    showView: 'Show view',
    hideView: 'Hide view',
    /** wait 300 ms, then writes text.afterShortWait. */
    waitShort: 'Wait short',
    /** wait 60000 ms (longer than the 15s interaction timeout, so only a click can end it in time), then writes text.afterLongWait. */
    waitLong: 'Wait long',
  },
  text: {
    start: 'DIALOGS START',
    /** Body of the msg dialog. */
    message: 'DIALOG MESSAGE',
    afterMessage: 'AFTER MESSAGE',
    /** Prompt of the input dialog. */
    inputPrompt: 'DIALOG PROMPT',
    afterShortWait: 'AFTER SHORT WAIT',
    afterLongWait: 'AFTER LONG WAIT',
  },
  /** Menu items in order; the `-:-` separator between them is not an item. */
  menu: {
    items: ['First item', 'Second item', 'Open message', 'Open submenu'],
    firstResult: 'MENU RESULT FIRST',
    secondResult: 'MENU RESULT SECOND',
    /** The third item opens a msg with this body; closing it writes msgClosedResult. */
    msgBody: 'MENU MSG',
    msgClosedResult: 'MENU MSG CLOSED',
    /** The fourth item's location opens a second menu with this one item; choosing it writes subResult. */
    subItem: 'Sub item',
    subResult: 'SUBMENU RESULT',
    /** Written when the menu is dismissed without choosing (the -1 path). */
    cancelResult: 'MENU CANCELLED',
  },
  /** The game writes `INPUT ECHO: <submitted text>`; empty submit/cancel gives just the prefix. */
  inputEcho: (submitted: string): string => `INPUT ECHO: ${submitted}`,
  /** Image file bundled in the archive and shown by the Show view action. */
  viewImage: 'view.png',
} as const;

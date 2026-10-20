// One test per spec file: WDIO starts a new session (a fresh app with its own XDG
// dirs, see wdio.desktop.conf.ts) per spec file, so each test starts with an empty shelf.
import { SHELF_TITLE } from '../shared/core-flow';
import { expectShelfTitles, openFixture, returnToShelf } from './player';

it('opening a game file starts it and adds it to the shelf', async () => {
  // The app opens the fixture from its CLI argument; there is no empty-shelf step.
  await openFixture();
  await returnToShelf();
  await expectShelfTitles([SHELF_TITLE]);
});

import { TEST_PACK } from '../fixtures/test-pack';
import { SeeNoticeContaining, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeShelfTitles, SeeShelfWritesSettled } from '../screenplay/shelf/checks';
import { RelaunchPlayerWith, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';
import { pluralTranslation } from '../screenplay/support/translations';

// What the desktop player does with its command line. Each scenario first lets the default launch (the
// pack as --file=<path>) shelve the pack and write it, then relaunches with its own arguments.

scenario.desktopOnly('an unknown command-line option still starts the player', async (player) => {
  // The CLI rejects the option; the player must start anyway, on the shelf it stored.
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    SeeShelfTitles([...TEST_PACK.titles]),
    SeeShelfWritesSettled(),
    RelaunchPlayerWith(['--no-such-option']),
    SeeStartupFinished(),
    SeeShelfTitles([...TEST_PACK.titles]),
  );
});

scenario.linuxDesktopOnly('a bare file path on the command line opens it', async (player) => {
  // What the OS passes for "Open with" or a double-click. The pack is already stored, so the shelf alone
  // proves nothing: the "N games added" notice shows only when this launch imported the file.
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    SeeShelfTitles([...TEST_PACK.titles]),
    SeeShelfWritesSettled(),
    RelaunchPlayerWith([TEST_PACK.configPath]),
    SeeNoticeContaining(pluralTranslation('en-US', '{{ count }} games added to shelf', TEST_PACK.titles.length)),
    SeeStartupFinished(),
    SeeShelfTitles([...TEST_PACK.titles]),
  );
});

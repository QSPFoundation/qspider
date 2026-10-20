import { E2E_GAME } from '../fixtures/e2e-game';
import { SeeGameStarted } from '../screenplay/common/checks';
import { OpenFixture, ReturnToShelf } from '../screenplay/game/tasks';
import { SeeShelfTitles } from '../screenplay/shelf/checks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

// Web starts on an empty shelf and opens the file from it. Desktop launches with the game
// as its argument, so the empty shelf is never shown there.
scenario.webOnly('opening a game file starts it and adds it to the shelf', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeShelfTitles([]), // clean state
    OpenGameFile(E2E_GAME.path),
    SeeGameStarted(E2E_GAME.text.start),
    ReturnToShelf(),
    SeeShelfTitles([E2E_GAME.shelfTitle]),
  );
});

scenario.desktopOnly('opening a game file starts it and adds it to the shelf', async (player) => {
  await player.attemptsTo(OpenFixture(), ReturnToShelf(), SeeShelfTitles([E2E_GAME.shelfTitle]));
});

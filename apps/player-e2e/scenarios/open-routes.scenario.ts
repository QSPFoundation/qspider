import { URL_GAME } from '../fixtures/url-game';
import { SeeErrorShown, SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { OpenGameUrl } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

/** Path of a fixture served by the player's own origin (see global-setup.ts). */
const served = (file: string): string => `/${URL_GAME.servedDir}/${file}`;

scenario.webOnly('importing a game by URL starts it', async (player) => {
  await player.attemptsTo(OpenGameUrl(served(URL_GAME.valid.file)), SeeGameStarted(URL_GAME.valid.startText));
});

scenario.webOnly('a failed URL import clears the loader and shows an error', async (player) => {
  await player.attemptsTo(OpenGameUrl(served(URL_GAME.invalid.file)), SeeStartupFinished(), SeeErrorShown());
});

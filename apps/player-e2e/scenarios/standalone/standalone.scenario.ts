// The standalone player (apps/player-standalone): it plays the game bundled in game/ next to its
// index.html, with no shelf. Run only by the standalone targets (e2e-standalone-web).
import { STANDALONE_GAME } from '../../fixtures/standalone-game';
import { SeeGameStarted, SeeStartupFinished } from '../../screenplay/common/checks';
import { StartPlayer } from '../../screenplay/support/operate-player';
import { scenario } from '../../screenplay/support/scenario';

const { text: TEXT } = STANDALONE_GAME;

// The bundled game.cfg lists two games; the exact start text fails if the second one started.
scenario('the bundled game starts by itself', async (player) => {
  await player.attemptsTo(StartPlayer(), SeeStartupFinished(), SeeGameStarted(TEXT.start));
});

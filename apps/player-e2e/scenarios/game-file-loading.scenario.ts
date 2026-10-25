// A game's own file open (inclib names a file): the engine waits until the player finishes the call.
import { ARCHIVES } from '../fixtures/archives';
import { EXTERNAL_THEME_GAME } from '../fixtures/external-theme-game';
import { INCLUDER_GAME } from '../fixtures/includer-game';
import {
  SeeActiveTheme,
  SeeErrorAlertText,
  SeeGameStarted,
  SeeNoticeContaining,
  SeeStartupFinished,
} from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT } = INCLUDER_GAME;
const FAILED = `Failed to open ${INCLUDER_GAME.missingFile}: `;

// The alert names the file and keeps the cause after the colon (the alert text goes through i18next's t()). The
// cause is the target's own: the web player's fetch error, and on desktop the OS error read_resource passes on
// (its wording differs by OS; the error number does not).
const failedOpenShowsError = (variant: typeof scenario.webOnly, causeParts: string[]): void =>
  variant('a game file that fails to open shows an error and the game goes on', async (player) => {
    await player.attemptsTo(
      StartPlayer(),
      SeeStartupFinished(),
      LoadGame(ARCHIVES.includerZip.path),
      SeeMainText(ARCHIVES.includerZip.includedMarker),
      ClickAction(ACTION.includeMissing),
      ...causeParts.map((part) => SeeErrorAlertText(part)),
      SeeMainText(TEXT.afterMissing), // the inclib statement finished, and the action went on after it
      ClickAction(ACTION.goOn),
      SeeMainText(TEXT.wentOn),
    );
  });

failedOpenShowsError(scenario.webOnly, [`${FAILED}File not found`]);
failedOpenShowsError(scenario.desktopOnly, [FAILED, '(os error 2)']);

// A game.cfg theme named by an absolute http URL is fetched by the desktop player's network route
// (libs/desktop data-fetcher), served here by the asset server. The web player has no such route.
scenario.desktopOnly('a theme from an external URL is applied', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(ARCHIVES.externalThemeZip.path),
    SeeGameStarted(EXTERNAL_THEME_GAME.startText),
    SeeActiveTheme(EXTERNAL_THEME_GAME.alias),
  );
});

scenario.desktopOnly('a theme URL that answers 404 is reported', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(ARCHIVES.externalTheme404Zip.path),
    SeeNoticeContaining(`${EXTERNAL_THEME_GAME.missingThemeUrl}: 404`),
  );
});

import { GAME_HTML } from '../fixtures/game-html-game';
import { OPENQST_GAME } from '../fixtures/openqst-game';
import { ARCHIVES } from '../fixtures/archives';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeElementText } from '../screenplay/content/checks';
import { ContentMark } from '../screenplay/content/elements';
import { SeeMainText, SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';
import { SeeCssValues } from '../screenplay/support/page-script';
import { scenario } from '../screenplay/support/scenario';
import { TypeInto } from '../screenplay/support/type-into';

const { action: A, text: T } = OPENQST_GAME;
const { actions: ACTION, marks: MARK, text: TEXT } = GAME_HTML;

scenario('a theme variable stays live after the game opens another file with OPENQST', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(ARCHIVES.openqstZip.path),
    SeeGameStarted(T.first),
    ClickAction(A.openSecond),
    SeeMainTextContaining(T.second),
    ClickAction(A.setColour),
    SeeMainTextContaining(T.colourSet),
    SeeCssValues({ root: true }, { '--code-color': OPENQST_GAME.expectedCodeColor }),
  );
});

scenario('qsp-variable shows a string stored in an unprefixed variable', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.watchers),
    SeeElementText(
      ContentMark(MARK.uvarBox),
      TEXT.unprefixed,
      `#actor sees the unprefixed variable read "${TEXT.unprefixed}"`,
    ),
  );
});

// Web only, for the reason given on the qsp-bind scenarios in game-html.scenario.ts (WebKitWebDriver drops typed characters).
scenario.webOnly('qsp-bind on an unprefixed variable holding a string stores typed text', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.bind),
    TypeInto('hello', ContentMark(MARK.ubindField)),
    ClickAction(ACTION.showUbind),
    SeeMainText(TEXT.ubound('hello')),
  );
});

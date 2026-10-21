import { GAME_HTML } from '../fixtures/game-html-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeContentText } from '../screenplay/content/checks';
import { AreaImage, ExecLink, NumLink } from '../screenplay/content/elements';
import { ClickContent } from '../screenplay/content/tasks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const { actions: ACTION, marks: MARK, text: TEXT } = GAME_HTML;

scenario('authored markup renders inside the main panel', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.markup),
    SeeContentText(MARK.bold, TEXT.bold),
  );
});

scenario('an exec link runs its code', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.links),
    ClickContent(ExecLink),
    SeeMainText(TEXT.execResult),
  );
});

scenario('a numeric link runs the matching action', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.links),
    ClickContent(NumLink),
    SeeMainText(TEXT.numResult),
  );
});

scenario('an image-map area runs its exec code', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.links),
    ClickContent(AreaImage),
    SeeMainText(TEXT.areaResult),
  );
});

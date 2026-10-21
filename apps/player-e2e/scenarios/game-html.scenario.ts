import { GAME_HTML } from '../fixtures/game-html-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeContentText } from '../screenplay/content/checks';
import { AreaImage, ExecLink, FormField, NumLink, OnClick, OnEnter, OnLeave } from '../screenplay/content/elements';
import { ClickContent, SubmitForm } from '../screenplay/content/tasks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { Hover, MoveAway } from '../screenplay/support/hover';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';
import { TypeInto } from '../screenplay/support/type-into';

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

// Each events outcome runs *clr, so every marker gets a fresh open.
scenario('qsp-on:click runs its code', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.events),
    ClickContent(OnClick),
    SeeMainText(TEXT.clickResult),
  );
});

// Each events outcome runs *clr, so every marker gets a fresh open.
scenario('qsp-on:mouseenter runs its code', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.events),
    Hover(OnEnter),
    SeeContentText(MARK.enterResult, TEXT.enterResult),
  );
});

// Each events outcome runs *clr, so every marker gets a fresh open.
scenario('qsp-on:mouseleave runs its code', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.events),
    Hover(OnLeave),
    MoveAway(OnClick),
    SeeContentText(MARK.leaveResult, TEXT.leaveResult),
  );
});

scenario('a form with qsp-on:submit runs its code on submit', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(GAME_HTML.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.form),
    TypeInto('hello', FormField),
    SubmitForm(),
    SeeMainText(TEXT.formResult),
  );
});

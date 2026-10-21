import { DIALOGS } from '../fixtures/dialogs-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeInput, SeeInputGone } from '../screenplay/input/checks';
import { CancelInput, SubmitInput } from '../screenplay/input/tasks';
import { SeeMenu, SeeMenuSeparator } from '../screenplay/menu/checks';
import { CancelMenu, ChooseMenuItem } from '../screenplay/menu/tasks';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';
import { SeeView, SeeViewGone } from '../screenplay/view/checks';
import { CloseView } from '../screenplay/view/tasks';

const { actions: ACTION, text: TEXT } = DIALOGS;

// The fixture has a single msg per action, so there is no several-in-a-row scenario.
scenario('a message box shows text and resumes the game when dismissed', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(DIALOGS.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.message),
    SeeMsg(TEXT.message),
    DismissMsg(),
    SeeMsgGone(),
    SeeMainText(TEXT.afterMessage),
  );
});

scenario('an input prompt returns the submitted text', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(DIALOGS.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.input),
    SeeInput(TEXT.inputPrompt),
    SubmitInput('hello'),
    SeeInputGone(),
    SeeMainText(DIALOGS.inputEcho('hello')),
  );
});

scenario('cancelling an input prompt returns empty text', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(DIALOGS.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.input),
    CancelInput(),
    SeeInputGone(),
    SeeMainText(DIALOGS.inputEcho('').trim()),
  );
});

scenario('selecting a menu item runs its location', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(DIALOGS.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.menu),
    SeeMenu(),
    SeeMenuSeparator(),
    ChooseMenuItem(DIALOGS.menu.items[0]),
    SeeMainText(DIALOGS.menu.firstResult),
  );
});

scenario('cancelling a menu returns to the game', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(DIALOGS.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.menu),
    SeeMenu(),
    CancelMenu(),
    SeeMainText(DIALOGS.menu.cancelResult),
  );
});

scenario('an image view opens and closes', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(DIALOGS.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.showView),
    SeeView(),
    CloseView(),
    SeeViewGone(),
  );
});

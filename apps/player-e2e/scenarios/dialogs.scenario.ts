import { DIALOGS } from '../fixtures/dialogs-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeInput, SeeInputGone } from '../screenplay/input/checks';
import { CancelInput, SubmitInput } from '../screenplay/input/tasks';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

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

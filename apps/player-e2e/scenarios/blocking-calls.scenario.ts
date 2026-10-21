import type { Activity } from '@serenity-js/core';
import { DIALOGS } from '../fixtures/dialogs-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction, PressActionHotkey, PressEscape } from '../screenplay/game/tasks';
import { SeeInput } from '../screenplay/input/checks';
import { SeeMenu } from '../screenplay/menu/checks';
import { ChooseMenuItem } from '../screenplay/menu/tasks';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { SeeNoPauseScreen } from '../screenplay/pause/checks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';
import { SeeWaiting } from '../screenplay/wait/checks';

const { actions: ACTION, text: TEXT } = DIALOGS;

const OVERLAYS: [string, string, () => Activity][] = [
  ['message box', ACTION.message, () => SeeMsg(TEXT.message)],
  ['input prompt', ACTION.input, () => SeeInput(TEXT.inputPrompt)],
  ['menu', ACTION.menu, () => SeeMenu()],
  // The long wait stays up; the player teardown ends it.
  ['wait lock', ACTION.waitLong, () => SeeWaiting()],
];

for (const [name, action, seeOverlay] of OVERLAYS) {
  scenario(`Escape does not open the pause screen over a ${name}`, async (player) => {
    await player.attemptsTo(
      StartPlayer(),
      SeeStartupFinished(),
      OpenGameFile(DIALOGS.path),
      SeeGameStarted(TEXT.start),
      ClickAction(action),
      seeOverlay(),
      PressEscape(),
      SeeNoPauseScreen(),
    );
  });
}

scenario('an action hotkey pressed over a message box leaves the game responsive', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(DIALOGS.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.message),
    SeeMsg(TEXT.message),
    PressActionHotkey(1),
    DismissMsg(),
    SeeMainText(TEXT.afterMessage),
  );
});

scenario('an action hotkey pressed over a menu leaves the menu usable', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(DIALOGS.path),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTION.menu),
    SeeMenu(),
    PressActionHotkey(1),
    // Safe expectation: the hotkey is ignored while the menu is open.
    SeeMsgGone(),
    SeeMenu(),
    ChooseMenuItem(DIALOGS.menu.items[0]),
    SeeMainText(DIALOGS.menu.firstResult),
  );
});

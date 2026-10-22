import { PANELS_GAME } from '../fixtures/panels-game';
import { SeeActionNotSelected, SeeActionSelected, SeeMainText } from '../screenplay/game/checks';
import { ClickAction, HoverAction, OpenPanelsFixture, PressActionHotkey, PressSpace } from '../screenplay/game/tasks';
import { MainText } from '../screenplay/game/elements';
import { MoveAway } from '../screenplay/support/hover';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT } = PANELS_GAME;

scenario('digit keys run the action at that position', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.keys),
    SeeMainText(TEXT.keysRoom),
    PressActionHotkey(2),
    SeeMainText(TEXT.keyTwo),
    PressActionHotkey(3),
    SeeMainText(TEXT.keyThree),
  );
});

scenario('a digit key beyond the action count does nothing', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.keys),
    SeeMainText(TEXT.keysRoom),
    PressActionHotkey(9),
    PressActionHotkey(1), // positive anchor: the game still takes input after the ignored key
    SeeMainText(TEXT.keyOne),
  );
});

scenario('space runs the only action', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.keys),
    ClickAction(ACTION.keys.single),
    SeeMainText(TEXT.singleRoom),
    PressSpace(),
    SeeMainText(TEXT.spaceRan),
  );
});

scenario('space does nothing when there are several actions', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.keys),
    SeeMainText(TEXT.keysRoom),
    PressSpace(),
    PressActionHotkey(1), // KEY ONE exactly: a Space that had run an action would have changed the text
    SeeMainText(TEXT.keyOne),
  );
});

scenario('hovering an action selects it', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.keys),
    SeeMainText(TEXT.keysRoom),
    HoverAction(ACTION.keys.second),
    SeeActionSelected(ACTION.keys.second),
    MoveAway(MainText),
    SeeActionNotSelected(ACTION.keys.second),
  );
});

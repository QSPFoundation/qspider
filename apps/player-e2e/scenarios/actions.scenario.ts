import { PANELS_GAME } from '../fixtures/panels-game';
import { SeeActionNotSelected, SeeActionSelected, SeeMainText } from '../screenplay/game/checks';
import { ClickAction, HoverAction, OpenPanelsFixture, PressActionHotkey, PressSpace } from '../screenplay/game/tasks';
import { MainText } from '../screenplay/game/elements';
import { MoveAway } from '../screenplay/support/hover';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT } = PANELS_GAME;

scenario('digit keys run the action at that position', async (player) => {
  // TEMPORARY (Task 5): fails this spec on Windows only, to see e2e-desktop-windows go red. Reverted next.
  if (process.platform === 'win32') throw new Error('TEMPORARY: forced failure (aggregate discrimination)');
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.keys),
    SeeMainText(TEXT.keysRoom),
    PressActionHotkey(2),
    SeeMainText(TEXT.keyLog('2')),
    PressActionHotkey(3),
    SeeMainText(TEXT.keyLog('23')),
  );
});

scenario('a digit key beyond the action count does nothing', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.keys),
    SeeMainText(TEXT.keysRoom),
    PressActionHotkey(9),
    PressActionHotkey(1), // the exact log "1" proves key 9 ran no action (it would have logged a digit first)
    SeeMainText(TEXT.keyLog('1')),
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
    PressActionHotkey(2), // the exact log "2" proves Space ran no action (it would have logged a digit first)
    SeeMainText(TEXT.keyLog('2')),
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

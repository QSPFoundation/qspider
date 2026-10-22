import { SAVES_GAME } from '../fixtures/saves-game';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction, OpenSavesFixture, PressQuickLoad, PressQuickSave } from '../screenplay/game/tasks';
import { SeeQuickSaveFilled } from '../screenplay/saves/checks';
import { CancelSavesPanel, OpenSavesPanel, QuickLoadFromPanel, QuickSaveFromPanel } from '../screenplay/saves/tasks';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT } = SAVES_GAME;

scenario('F5 quicksaves and F9 quickloads', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    PressQuickSave(),
    // F5 gives no UI feedback and the write is async: settle on the filled quicksave slot before moving on.
    OpenSavesPanel(),
    SeeQuickSaveFilled(),
    CancelSavesPanel(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    PressQuickLoad(),
    SeeMainText(TEXT.counter(1)),
  );
});

scenario("the saves panel's quicksave slot saves and loads", async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    OpenSavesPanel(),
    QuickSaveFromPanel(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    OpenSavesPanel(),
    QuickLoadFromPanel(),
    SeeMainText(TEXT.counter(1)),
  );
});

scenario('quickload without a quicksave changes nothing', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    PressQuickLoad(),
    // Positive anchor: the game still responds and kept its state (no reset to 0, no error dialog blocking it).
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
  );
});

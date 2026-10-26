import { SAVES_GAME } from '../fixtures/saves-game';
import { SeeMainText, SeeMainTextContaining } from '../screenplay/game/checks';
import {
  ClickAction,
  OpenSavesFixture,
  PressEscape,
  PressLoadHotkey,
  PressQuickLoad,
  PressQuickSave,
  PressSaveHotkey,
} from '../screenplay/game/tasks';
import { SeeNoPauseScreen } from '../screenplay/pause/checks';
import { SeeQuickSaveFilled, SeeRequestedSaveCommand, SeeSlotFilled } from '../screenplay/saves/checks';
import {
  CancelSavesPanel,
  LoadFromSlot,
  OpenSavesPanel,
  QuickLoadFromPanel,
  QuickSaveFromPanel,
  SaveToSlot,
  ShowSavesPanel,
} from '../screenplay/saves/tasks';
import { RecordKeyDefaults, SeeKeyDefault } from '../screenplay/support/key-defaults';
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

scenario('Ctrl+S opens the saves panel to save', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    PressSaveHotkey(),
    SeeRequestedSaveCommand('save'),
    SaveToSlot(1),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    ClickAction(ACTION.load),
    LoadFromSlot(1),
    SeeMainText(TEXT.counter(1)),
  );
});

scenario('Ctrl+O opens the saves panel to load', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    PressLoadHotkey(),
    SeeRequestedSaveCommand('load'),
    LoadFromSlot(1),
    SeeMainText(TEXT.counter(1)),
  );
});

scenario('NOSAVE blocks quicksave', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    PressQuickSave(),
    // Anchor: the allowed F5 reached disk, so only the blocked F5 below could change the slot.
    OpenSavesPanel(),
    SeeQuickSaveFilled(),
    CancelSavesPanel(),
    ClickAction(ACTION.enableNosave),
    SeeMainTextContaining(TEXT.nosaveOn),
    ClickAction(ACTION.increment),
    SeeMainTextContaining(TEXT.counter(2)),
    PressQuickSave(),
    ClickAction(ACTION.increment),
    SeeMainTextContaining(TEXT.counter(3)),
    PressQuickLoad(),
    // Still the counter-1 quicksave: the blocked F5 at counter 2 saved nothing.
    SeeMainTextContaining(TEXT.counter(1)),
  );
});

scenario('NOSAVE blocks Ctrl+S', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.enableNosave),
    SeeMainTextContaining(TEXT.nosaveOn),
    RecordKeyDefaults(),
    PressSaveHotkey(),
    // The player keeps Ctrl+S: the browser's own save dialog is prevented even though nothing is saved.
    SeeKeyDefault({ key: 's', ctrl: true, prevented: true }),
    // The action result is the anchor: a saves panel opened by Ctrl+S would have paused the game.
    ClickAction(ACTION.increment),
    SeeMainTextContaining(TEXT.counter(1)),
    SeeNoPauseScreen(),
  );
});

scenario('NOSAVE: Escape opens the pause screen for loading only', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(1)),
    ClickAction(ACTION.save),
    SaveToSlot(1),
    ClickAction(ACTION.increment),
    SeeMainText(TEXT.counter(2)),
    ClickAction(ACTION.enableNosave),
    SeeMainTextContaining(TEXT.nosaveOn),
    PressEscape(),
    SeeRequestedSaveCommand('load'),
    ShowSavesPanel(),
    LoadFromSlot(1),
    SeeMainTextContaining(TEXT.counter(1)),
  );
});

scenario('cancelling a load request restores the normal saves panel', async (player) => {
  await player.attemptsTo(
    OpenSavesFixture(),
    PressLoadHotkey(),
    SeeRequestedSaveCommand('load'),
    CancelSavesPanel(),
    // The cancelled Ctrl+O must not leave the panel load-only: its Save button has to work.
    OpenSavesPanel(),
    SaveToSlot(1),
    OpenSavesPanel(),
    SeeSlotFilled(1),
  );
});

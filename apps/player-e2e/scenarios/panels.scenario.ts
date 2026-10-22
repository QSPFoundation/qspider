import { PANELS_GAME } from '../fixtures/panels-game';
import { SubmitCommand } from '../screenplay/cmd/tasks';
import { SeeCommandInput, SeeNoCommandLine } from '../screenplay/cmd/checks';
import { SeeMainText, SeeMainTextContaining, SeeNoActionsPanel } from '../screenplay/game/checks';
import { ClickAction, ClickShowActionsLink, OpenPanelsFixture } from '../screenplay/game/tasks';
import { SeeNoObjectsPanel, SeeObjectImage, SeeObjects } from '../screenplay/objects/checks';
import { SelectObject } from '../screenplay/objects/tasks';
import { SeeNoStatsPanel, SeeStats, SeeStatsContaining } from '../screenplay/stats/checks';
import { TypeInto } from '../screenplay/support/type-into';
import { CommandInput } from '../screenplay/cmd/elements';
import { scenario } from '../screenplay/support/scenario';

const { action: ACTION, text: TEXT, object: OBJECT } = PANELS_GAME;

scenario('the stats panel shows what the game writes', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.stats),
    ClickAction(ACTION.stats.write),
    SeeStats(TEXT.statsOne),
    ClickAction(ACTION.stats.add),
    SeeStatsContaining(TEXT.statsTwo),
    SeeStatsContaining(TEXT.statsOne),
  );
});

scenario('hiding and showing the stats panel keeps its content', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.stats),
    ClickAction(ACTION.stats.write),
    SeeStats(TEXT.statsOne), // settled anchor for the absence check below
    ClickAction(ACTION.stats.hideStats),
    SeeNoStatsPanel(),
    ClickAction(ACTION.stats.showStats),
    SeeStats(TEXT.statsOne),
  );
});

scenario('objects are listed in order with their images', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.objects),
    ClickAction(ACTION.objects.addLamp),
    ClickAction(ACTION.objects.addKey),
    SeeObjects([OBJECT.lamp, OBJECT.key]),
    SeeObjectImage(OBJECT.lamp, PANELS_GAME.objectImage),
    ClickAction(ACTION.objects.removeKey),
    SeeObjects([OBJECT.lamp]),
  );
});

scenario("selecting an object runs the game's selection code", async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.objects),
    ClickAction(ACTION.objects.addLamp),
    SeeObjects([OBJECT.lamp]),
    SelectObject(OBJECT.lamp),
    SeeMainText(TEXT.selected(OBJECT.lamp)),
  );
});

scenario('hiding the objects panel', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.objects),
    ClickAction(ACTION.objects.addLamp),
    SeeObjects([OBJECT.lamp]), // settled anchor for the absence check below
    ClickAction(ACTION.objects.hideObjects),
    SeeNoObjectsPanel(),
    ClickAction(ACTION.objects.showObjects),
    SeeObjects([OBJECT.lamp]),
  );
});

scenario("the command line runs the game's command handler", async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.command),
    ClickAction(ACTION.command.showInput),
    SubmitCommand('hello'),
    SeeMainText(TEXT.typed('hello')),
  );
});

scenario('the game can clear the command line', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.command),
    ClickAction(ACTION.command.showInput),
    TypeInto('hello', CommandInput),
    SeeCommandInput('hello'), // anchor: the typed text is in the field
    ClickAction(ACTION.command.clearInput),
    SeeCommandInput(''),
  );
});

scenario('hiding the command line', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.command),
    ClickAction(ACTION.command.showInput),
    SeeCommandInput(''), // settled anchor: the command line is shown
    ClickAction(ACTION.command.hideInput),
    SeeNoCommandLine(),
  );
});

scenario('hiding the actions panel', async (player) => {
  await player.attemptsTo(
    OpenPanelsFixture(),
    ClickAction(ACTION.start.stats),
    ClickAction(ACTION.stats.hideActions),
    SeeMainTextContaining(TEXT.actionsHidden), // settled anchor for the absence check below
    SeeNoActionsPanel(),
    ClickShowActionsLink(),
    ClickAction(ACTION.stats.write), // the actions are back
  );
});

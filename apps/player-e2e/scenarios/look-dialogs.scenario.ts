import { LOOK_GAME } from '../fixtures/look-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeInput, SeeInputGone } from '../screenplay/input/checks';
import { CancelInput } from '../screenplay/input/tasks';
import { SeeMenu } from '../screenplay/menu/checks';
import { CancelMenu } from '../screenplay/menu/tasks';
import { SeeMsg, SeeMsgGone } from '../screenplay/msg/checks';
import { DismissMsg } from '../screenplay/msg/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { SeeCssValues } from '../screenplay/support/page-script';
import { scenario } from '../screenplay/support/scenario';
import {
  SeeMainTextTwice,
  SeeMenuAnchorAt,
  SeeMenuFixed,
  SeeNoOverlay,
  SeeOverlay,
} from '../screenplay/themes/aero/checks';
import { SeeView, SeeViewGone } from '../screenplay/view/checks';
import { ClickView } from '../screenplay/view/tasks';
import type { Activity } from '@serenity-js/core';

const { text: TEXT, actions: ACTIONS, dialog: DIALOG, place: PLACE } = LOOK_GAME;

const OpenDialogs = (): Activity[] => [
  StartPlayer(),
  SeeStartupFinished(),
  OpenGameFile(LOOK_GAME.aeroPath),
  SeeGameStarted(TEXT.start),
  ClickAction(ACTIONS.start.toDialogs),
  SeeMainTextContaining(TEXT.dialogs),
];

const px = (n: number): string => `${n}px`;

scenario('DISABLESHADE removes the dialog shade', async (player) => {
  await player.attemptsTo(
    ...OpenDialogs(),
    ClickAction(ACTIONS.dialogs.msg),
    SeeMsg(DIALOG.msg),
    SeeOverlay(),
    DismissMsg(),
    SeeMsgGone(),
    ClickAction(ACTIONS.dialogs.noShade),
    ClickAction(ACTIONS.dialogs.msg),
    // The message is the settled anchor: the dialog is open, so a missing shade is real.
    SeeMsg(DIALOG.msg),
    SeeNoOverlay(),
  );
});

scenario('MSG, INPUT and MENU positions place the dialogs', async (player) => {
  await player.attemptsTo(
    ...OpenDialogs(),
    ClickAction(ACTIONS.dialogs.msg),
    SeeMsg(DIALOG.msg),
    SeeCssValues({ qsp: 'msg' }, { '--aero-msg-x': '200px', '--aero-msg-y': '165px' }),
    DismissMsg(),
    SeeMsgGone(),
    ClickAction(ACTIONS.dialogs.place),
    ClickAction(ACTIONS.dialogs.msg),
    SeeMsg(DIALOG.msg),
    SeeCssValues({ qsp: 'msg' }, { '--aero-msg-x': px(PLACE.msg[0]), '--aero-msg-y': px(PLACE.msg[1]) }),
    DismissMsg(),
    SeeMsgGone(),
    ClickAction(ACTIONS.dialogs.input),
    SeeInput(DIALOG.input),
    SeeCssValues({ qsp: 'input' }, { '--aero-input-x': px(PLACE.input[0]), '--aero-input-y': px(PLACE.input[1]) }),
    CancelInput(),
    SeeInputGone(),
    ClickAction(ACTIONS.dialogs.menu),
    SeeMenu(),
    SeeMenuAnchorAt(PLACE.menu[0], PLACE.menu[1]),
  );
});

scenario('FIXED_SIZE_MENU fixes the menu size', async (player) => {
  await player.attemptsTo(
    ...OpenDialogs(),
    ClickAction(ACTIONS.dialogs.menu),
    SeeMenu(),
    SeeMenuFixed(false),
    CancelMenu(),
    ClickAction(ACTIONS.dialogs.fixedMenu),
    ClickAction(ACTIONS.dialogs.menu),
    SeeMenu(),
    SeeMenuFixed(true),
  );
});

scenario('ALWAYS_SHOW_VIEW keeps the view open', async (player) => {
  await player.attemptsTo(
    ...OpenDialogs(),
    // Control: a click closes the view.
    ClickAction(ACTIONS.dialogs.view),
    SeeView(),
    ClickView(),
    SeeViewGone(),
    // With the flag the click is ignored: the second LOG line proves the page is still responsive.
    ClickAction(ACTIONS.dialogs.keepView),
    SeeMainTextContaining(TEXT.log),
    ClickAction(ACTIONS.dialogs.view),
    SeeView(),
    ClickView(),
    ClickAction(ACTIONS.dialogs.keepView),
    SeeMainTextTwice(TEXT.log),
    SeeView(),
  );
});

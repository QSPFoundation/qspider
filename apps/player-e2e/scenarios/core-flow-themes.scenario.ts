import { E2E_GAME } from '../fixtures/e2e-game';
import { CORE_THEME_VARIANTS } from '../fixtures/themes-game';
import { SeeActiveTheme, SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainText } from '../screenplay/game/checks';
import { ClickAction, ReachCounter } from '../screenplay/game/tasks';
import { SeeSlotEmpty } from '../screenplay/saves/checks';
import { ChooseSaveSlot } from '../screenplay/saves/tasks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { forEachTheme } from '../screenplay/support/for-each-theme';
import type { ThemeVariant } from '../fixtures/themes-game';
import type { Actor } from '@serenity-js/core';

// The core flows under the non-default themes, web only (maintainer decision, 2026-10-22). The
// variant's e2e game is opened as a file; the pack/shelf flows are theme-independent (core-flow).
const { action: ACTION, text: TEXT } = E2E_GAME;
const SAVE_SLOT = 1;

const openThemed = (player: Actor, variant: ThemeVariant) =>
  player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(variant.e2eGamePath),
    SeeGameStarted(TEXT.start),
    SeeActiveTheme(variant.alias),
  );

forEachTheme(
  CORE_THEME_VARIANTS,
  'actions update the game text',
  async (player, variant) => {
    await openThemed(player, variant);
    await player.attemptsTo(
      ClickAction(ACTION.goToRoom),
      SeeMainText(TEXT.room(0)),
      ClickAction(ACTION.increment),
      SeeMainText(TEXT.room(1)),
    );
  },
  { webOnly: true },
);

forEachTheme(
  CORE_THEME_VARIANTS,
  'loading a save restores the saved state',
  async (player, variant) => {
    await openThemed(player, variant);
    await player.attemptsTo(
      ReachCounter(1),
      ClickAction(ACTION.save),
      SeeSlotEmpty(SAVE_SLOT),
      ChooseSaveSlot(SAVE_SLOT),
      ClickAction(ACTION.increment),
      SeeMainText(TEXT.room(2)),
      ClickAction(ACTION.load),
      ChooseSaveSlot(SAVE_SLOT),
      SeeMainText(TEXT.room(1)),
    );
  },
  { webOnly: true },
);

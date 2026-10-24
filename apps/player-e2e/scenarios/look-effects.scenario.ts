import { LOOK_GAME } from '../fixtures/look-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeNewlocEffectInFlight } from '../screenplay/themes/aero/checks';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const { text: TEXT, actions: ACTIONS } = LOOK_GAME;

// Each action sets the effect variables and jumps in the same click.
scenario('a new-location effect animates the change', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(LOOK_GAME.aeroPath),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTIONS.start.toEffects),
    SeeMainTextContaining(TEXT.effects),
    ClickAction(ACTIONS.effects.slowFade),
    // The 60 s fade keeps the wrapper mid-animation for the whole scenario. Its content is not asserted here:
    // at opacity ~0 WebDriver reports it as not displayed. The fast scenario below proves the content arrives.
    SeeNewlocEffectInFlight(),
  );
});

// Slide, then Back, then a sequential fade: the sequential effect updates the content only after the old one left.
scenario('fast and sequential effects still deliver the new location', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    LoadGame(LOOK_GAME.aeroPath),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTIONS.start.toEffects),
    SeeMainTextContaining(TEXT.effects),
    ClickAction(ACTIONS.effects.quickSlide),
    SeeMainTextContaining(TEXT.arrived),
    ClickAction(ACTIONS.arrive.back),
    SeeMainTextContaining(TEXT.effects),
    ClickAction(ACTIONS.effects.seqFade),
    SeeMainTextContaining(TEXT.arrived),
  );
});

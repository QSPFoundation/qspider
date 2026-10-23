import { LOOK_GAME } from '../fixtures/look-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction } from '../screenplay/game/tasks';
import { SeeNewlocEffectInFlight } from '../screenplay/themes/aero/checks';
import { OpenGameFile, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

const { text: TEXT, actions: ACTIONS } = LOOK_GAME;

// The click that sets the effect variables and the click that jumps are separate (see the fixture).
scenario('a new-location effect animates the change', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(LOOK_GAME.aeroPath),
    SeeGameStarted(TEXT.start),
    ClickAction(ACTIONS.start.toEffects),
    SeeMainTextContaining(TEXT.effects),
    ClickAction(ACTIONS.effects.slowFade),
    ClickAction(ACTIONS.effects.arrive),
    // The 60 s fade keeps the wrapper mid-animation for the whole scenario. Its content is not asserted here:
    // at opacity ~0 WebDriver reports it as not displayed. The fast scenarios below prove the content arrives.
    SeeNewlocEffectInFlight(),
  );
});

for (const [title, effect] of [
  ['a slide effect still delivers the new location', ACTIONS.effects.quickSlide],
  ['a sequential fade still delivers the new location', ACTIONS.effects.seqFade],
] as const) {
  scenario(title, async (player) => {
    await player.attemptsTo(
      StartPlayer(),
      SeeStartupFinished(),
      OpenGameFile(LOOK_GAME.aeroPath),
      SeeGameStarted(TEXT.start),
      ClickAction(ACTIONS.start.toEffects),
      SeeMainTextContaining(TEXT.effects),
      ClickAction(effect),
      ClickAction(ACTIONS.effects.arrive),
      SeeMainTextContaining(TEXT.arrived),
    );
  });
}

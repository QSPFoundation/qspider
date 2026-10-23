import { SeeStartupFinished } from '../screenplay/common/checks';
import { CurrentPlayerTheme, SeePlayerTheme } from '../screenplay/shelf/checks';
import { ToggleShelfTheme } from '../screenplay/shelf/tasks';
import { RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

// The theme the player starts with depends on the OS colour scheme, so the scenario reads it first
// and only ever asserts relative to it: the chosen theme is the opposite of the initial one.
scenario('the chosen player theme persists across a restart', async (player) => {
  await player.attemptsTo(StartPlayer(), SeeStartupFinished());
  const initial = (await player.answer(CurrentPlayerTheme())) === 'dark' ? 'dark' : 'light';
  const chosen = initial === 'dark' ? 'light' : 'dark';
  await player.attemptsTo(
    ToggleShelfTheme(),
    SeePlayerTheme(chosen),
    RestartPlayer(),
    SeeStartupFinished(),
    SeePlayerTheme(chosen),
    ToggleShelfTheme(),
    SeePlayerTheme(initial),
    RestartPlayer(),
    SeeStartupFinished(),
    SeePlayerTheme(initial),
  );
});

import { SeeStartupFinished } from '../screenplay/common/checks';
import { SeePlayerTheme } from '../screenplay/shelf/checks';
import { ToggleShelfTheme } from '../screenplay/shelf/tasks';
import { RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';

// Toggles explicitly before the restart, so the scenario does not depend on the OS colour scheme
// (the headless browser starts light).
scenario('the dark player theme persists across a restart', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    SeePlayerTheme('light'),
    ToggleShelfTheme(),
    SeePlayerTheme('dark'),
    RestartPlayer(),
    SeeStartupFinished(),
    SeePlayerTheme('dark'),
    ToggleShelfTheme(),
    SeePlayerTheme('light'),
  );
});

import { ARCHIVES } from '../fixtures/archives';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { ReturnToShelf } from '../screenplay/game/tasks';
import { SeePauseLanguage, SeePreferencesLabel } from '../screenplay/pause/checks';
import { OpenPreferences, SwitchPauseLanguage } from '../screenplay/pause/tasks';
import { SeeRunLinkText, SeeShelfIncludes, SeeShelfLanguage } from '../screenplay/shelf/checks';
import { SwitchShelfLanguage } from '../screenplay/shelf/tasks';
import { OpenGameFile, RestartPlayer, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';
import { translation } from '../screenplay/support/translations';

const { title: TITLE, path: PATH, startText: START } = ARCHIVES.singleZip;
const RUN = (lng: string) => translation(lng, 'Run');
const PREFERENCES = (lng: string) => translation(lng, 'Preferences');

scenario('switching the language re-renders the player and persists', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(PATH),
    SeeGameStarted(START),
    ReturnToShelf(),
    SeeShelfIncludes(TITLE),
    SeeRunLinkText(TITLE, RUN('en-US')),
    SwitchShelfLanguage('ru-RU'),
    SeeShelfLanguage('ru-RU'),
    SeeRunLinkText(TITLE, RUN('ru-RU')),
    RestartPlayer(),
    SeeStartupFinished(),
    SeeShelfIncludes(TITLE),
    SeeShelfLanguage('ru-RU'),
    SeeRunLinkText(TITLE, RUN('ru-RU')),
    SwitchShelfLanguage('en-US'),
    SeeShelfLanguage('en-US'),
    SeeRunLinkText(TITLE, RUN('en-US')),
  );
});

scenario('the pause-screen language select switches the language', async (player) => {
  await player.attemptsTo(
    StartPlayer(),
    SeeStartupFinished(),
    OpenGameFile(PATH),
    SeeGameStarted(START),
    OpenPreferences(),
    SeePreferencesLabel(PREFERENCES('en-US')),
    SwitchPauseLanguage('uk-UA'),
    SeePauseLanguage('uk-UA'),
    SeePreferencesLabel(PREFERENCES('uk-UA')),
  );
});

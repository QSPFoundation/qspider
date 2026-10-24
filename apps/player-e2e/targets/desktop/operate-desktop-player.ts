import type { Answerable, AnswersQuestions, PerformsActivities, UsesAbilities } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import { StartupFinishedMarker } from '../../screenplay/common/elements';
import { OpenGameButton } from '../../screenplay/shelf/elements';
import { OperatePlayer } from '../../screenplay/support/operate-player';
import { ClickWhenPresent, waitUntilPresent } from '../../screenplay/support/presence';
import { appRunning, expectAppExit, restartAppKeepingData, restartAppKeepingDataWith } from './fresh-app';
import { pickFileInNativeDialog } from './native-dialog';
import { desktopPlatform } from './platform';

/**
 * The desktop player: tauri-driver launches the app with the test pack's game.cfg as its argument
 * (wdio.conf.ts), so it starts on the shelf with the pack loaded. Game files open through the
 * native Open game dialog, driven through AT-SPI or UI Automation (native-dialog.ts); setup loads use the drop route.
 */
export class OperateDesktopPlayer extends OperatePlayer {
  async startPlayer(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // Already launched.
  }

  async restartPlayer(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // A new app process on the same private app data; it is launched with the pack again.
    await restartAppKeepingData();
  }

  async relaunchPlayerWith(_actor: UsesAbilities & AnswersQuestions, args: string[]): Promise<void> {
    // A new app process on the same private app data, launched with `args` instead of the pack.
    await restartAppKeepingDataWith(args);
  }

  async loadTestPack(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // Loaded at launch from the app's argument.
  }

  async openGameUrl(_actor: UsesAbilities & AnswersQuestions, _url: string): Promise<void> {
    throw new Error('openGameUrl is not supported on desktop');
  }

  async delayRequests(_actor: UsesAbilities & AnswersQuestions, _pathSuffix: string, _ms: number): Promise<void> {
    throw new Error('delayRequests is not supported on desktop');
  }

  async routeThroughProxy(_actor: UsesAbilities & AnswersQuestions, _origin: string): Promise<void> {
    throw new Error('routeThroughProxy is not supported on desktop');
  }

  async proxiedUrls(_actor: UsesAbilities & AnswersQuestions): Promise<string[]> {
    throw new Error('proxiedUrls is not supported on desktop');
  }

  async emulateColorScheme(_actor: UsesAbilities & AnswersQuestions, _scheme: 'light' | 'dark'): Promise<void> {
    throw new Error('emulateColorScheme is not supported on desktop');
  }

  async appRunning(_actor: UsesAbilities & AnswersQuestions): Promise<boolean> {
    return appRunning();
  }

  async expectAppExit(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    expectAppExit();
  }

  async openGameFile(actor: UsesAbilities & AnswersQuestions & PerformsActivities, path: string): Promise<void> {
    await actor.attemptsTo(ClickWhenPresent(OpenGameButton));
    await pickFileInNativeDialog(path);
  }

  async clickMapArea(
    actor: UsesAbilities & AnswersQuestions & PerformsActivities,
    area: Answerable<PageElement>,
    image: Answerable<PageElement>,
  ): Promise<void> {
    // The element this OS's WebDriver accepts the click on (platform/index.ts, mapAreaClick).
    await actor.attemptsTo(ClickWhenPresent(desktopPlatform().mapAreaClick === 'area' ? area : image));
  }

  async loadGame(actor: UsesAbilities & AnswersQuestions & PerformsActivities, path: string): Promise<void> {
    // The drop route: the same importDesktop + addImported as the dialog (apps/player-desktop app.tsx,
    // open-game-button.tsx), without the native dialog. Waits for the startup marker (init() done, the launch
    // pack's start decision made, the drop listener up) and for the Open game button (openGameFile's
    // precondition: on the shelf, so the drop never replaces a running game).
    await actor.attemptsTo(waitUntilPresent(StartupFinishedMarker), waitUntilPresent(OpenGameButton));
    await this.dropGameFile(actor, path);
  }

  async dropGameFile(_actor: UsesAbilities & AnswersQuestions, path: string): Promise<void> {
    await browser.execute(async (p: string) => {
      const internals = (window as unknown as { __TAURI_INTERNALS__: { invoke(c: string, a: object): Promise<void> } })
        .__TAURI_INTERNALS__;
      await internals.invoke('plugin:event|emit', {
        event: 'tauri://drag-drop',
        payload: { type: 'drop', paths: [p], position: { x: 1, y: 1 } },
      });
    }, path);
  }
}

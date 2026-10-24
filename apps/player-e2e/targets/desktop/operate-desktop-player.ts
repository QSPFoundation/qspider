import type { AnswersQuestions, PerformsActivities, UsesAbilities } from '@serenity-js/core';
import { OpenGameButton } from '../../screenplay/shelf/elements';
import { OperatePlayer } from '../../screenplay/support/operate-player';
import { ClickWhenPresent } from '../../screenplay/support/presence';
import { appRunning, expectAppExit, restartAppKeepingData } from './fresh-app';
import { pickFileInNativeDialog } from './native-dialog';

/**
 * The desktop player: tauri-driver launches the app with the test pack's game.cfg as its argument
 * (wdio.conf.ts), so it starts on the shelf with the pack loaded. Game files open through the
 * native Open game dialog, driven through AT-SPI (native-dialog.ts).
 */
export class OperateDesktopPlayer extends OperatePlayer {
  async startPlayer(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // Already launched.
  }

  async restartPlayer(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // A new app process on the same private app data; it is launched with the pack again.
    await restartAppKeepingData();
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

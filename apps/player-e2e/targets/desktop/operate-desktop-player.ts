import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { OperatePlayer } from '../../screenplay/support/operate-player';
import { assertLaunchFixture } from './launch-fixture';

/**
 * The desktop player: tauri-driver launches the app with the launch fixture as its argument
 * (wdio.conf.ts), so it is already started with that game open.
 */
export class OperateDesktopPlayer extends OperatePlayer {
  async startPlayer(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // Already launched.
  }

  async openGameFile(_actor: UsesAbilities & AnswersQuestions, path: string): Promise<void> {
    // Opened at launch from the app's argument; any other file cannot be opened.
    assertLaunchFixture(path);
  }
}

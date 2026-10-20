import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { OperatePlayer } from '../../screenplay/support/operate-player';

/**
 * The desktop player: tauri-driver launches the app with the fixture game as its argument
 * (wdio.conf.ts), so it is already started with the game open.
 */
export class OperateDesktopPlayer extends OperatePlayer {
  async startPlayer(_actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // Already launched.
  }

  async openGameFile(_actor: UsesAbilities & AnswersQuestions, _path: string): Promise<void> {
    // Opened at launch from the app's argument.
  }
}

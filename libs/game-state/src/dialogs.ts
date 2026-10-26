import { input$ } from './input';
import { menu$ } from './menu';
import { msg$ } from './msg';

/**
 * Closes every dialog when the game stops, answering the engine as a cancel would. The engine resumes inside
 * each answer, so a callback can open another kind of dialog after that one was cleared: the silent resets
 * discard it.
 */
export function clearDialogs(): void {
  input$.actions.clear();
  menu$.actions.clear();
  msg$.actions.clear();
  input$.actions.reset();
  menu$.actions.reset();
  msg$.actions.reset();
}

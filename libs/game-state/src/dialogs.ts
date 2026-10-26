import { input$ } from './input';
import { menu$ } from './menu';
import { msg$ } from './msg';

/** Closes every dialog when the game stops, answering the engine as a cancel would. */
export function clearDialogs(): void {
  input$.actions.clear();
  menu$.actions.clear();
  msg$.actions.clear();
}

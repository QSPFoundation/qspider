import { waitUntilAbsent } from '../support/presence';
import { PauseScreen } from './elements';

export const SeeNoPauseScreen = () => waitUntilAbsent(PauseScreen);

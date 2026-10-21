import { waitUntilAbsent, waitUntilPresent } from '../support/presence';
import { WaitLock } from './elements';

export const SeeWaiting = () => waitUntilPresent(WaitLock);

export const SeeWaitDone = () => waitUntilAbsent(WaitLock);

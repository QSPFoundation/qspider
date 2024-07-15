import { defer } from '@qspider/utils';
import { atom } from 'xoid';

export const baseInit$ = atom(false);
export const initDeferred$ = atom(defer<void>());
export const initialBaseUrl$ = atom('/');

import { defer } from '@qspider/utils';
import create from 'xoid';

export const baseInit$ = create(false);
export const initDeferred$ = create(defer<void>());
export const initialBaseUrl$ = create('/');

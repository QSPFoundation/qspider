import { defer } from '@qspider/utils';
import create from 'xoid';

export const baseInit$ = create(false);
export const initDefered$ = create(defer<void>());

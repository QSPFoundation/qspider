import { Task } from '@serenity-js/core';
import { waitUntilAbsent, waitUntilPresent } from '../support/presence';
import { View, ViewImage } from './elements';

/** Asserts the view and its image element exist, not that the bitmap painted. */
export const SeeView = (): Task =>
  Task.where('#actor sees the image view and its image element', waitUntilPresent(View), waitUntilPresent(ViewImage));

export const SeeViewGone = () => waitUntilAbsent(View);

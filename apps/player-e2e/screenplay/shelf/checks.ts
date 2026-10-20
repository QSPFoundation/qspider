import { Task } from '@serenity-js/core';
import { contain, equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { PresenceOf } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { EmptyShelfNotice, Notice, Shelf, ShelfTitles } from './elements';

/** The shelf eventually lists exactly `titles`, in order. `[]`: the shelf shows its empty notice. */
export const SeeShelfTitles = (titles: string[]): Task => {
  const listed = seeEventually(
    Shelf,
    () => ShelfTitles.eachMappedTo(Text),
    equals(titles),
    `#actor sees the shelf list ${titles.length > 0 ? titles.join(', ') : 'no games'}`,
  );
  if (titles.length > 0) return listed;
  return Task.where(
    '#actor sees an empty shelf',
    seeEventually(EmptyShelfNotice, (e) => PresenceOf(e), equals(true), '#actor sees the empty shelf notice'),
    listed,
  );
};

/** The shelf eventually lists a game titled `title`, among any others. */
export const SeeShelfIncludes = (title: string): Task =>
  seeEventually(Shelf, () => ShelfTitles.eachMappedTo(Text), contain(title), `#actor sees "${title}" on the shelf`);

/** The notice eventually reads `text` (it closes itself after a few seconds). */
export const SeeNotice = (text: string): Task =>
  seeEventually(Notice, (e) => Text.of(e).trim(), equals(text), `#actor sees the notice "${text}"`);

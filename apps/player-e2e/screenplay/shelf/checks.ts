import { Task } from '@serenity-js/core';
import { contain, equals, not } from '@serenity-js/assertions';
import { Attribute, Text } from '@serenity-js/web';
import { PresenceOf } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { EmptyShelfNotice, Shelf, ShelfTitles } from './elements';

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

/** The shelf eventually lists no game titled `title`. Needs a settled anchor first (a positive shelf state). */
export const SeeShelfLacks = (title: string): Task =>
  seeEventually(
    Shelf,
    () => ShelfTitles.eachMappedTo(Text),
    not(contain(title)),
    `#actor sees "${title}" gone from the shelf`,
  );

/**
 * Every shelf change has reached storage (the shelf's non-visible pending-writes counter is 0). The
 * shelf changes optimistically, so its cards prove nothing about storage: check this before RestartPlayer.
 */
export const SeeShelfWritesSettled = (): Task =>
  seeEventually(
    Shelf,
    (e) => Attribute.called('data-pending-writes').of(e),
    equals('0'),
    '#actor sees the shelf changes written to storage',
  );

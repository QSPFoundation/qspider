import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
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

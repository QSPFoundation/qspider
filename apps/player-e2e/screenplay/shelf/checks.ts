import { Task } from '@serenity-js/core';
import { equals, isPresent } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { seeEventually } from '../support/seeEventually';
import { EmptyShelfNotice, Shelf, ShelfTitles } from './elements';

/** The shelf lists exactly `titles`, in order, so a duplicate fails. `[]`: the shelf shows its empty notice. */
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
    seeEventually(EmptyShelfNotice, (e) => e, isPresent(), '#actor sees the empty shelf notice'),
    listed,
  );
};

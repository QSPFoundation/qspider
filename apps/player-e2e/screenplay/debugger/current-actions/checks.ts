import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Attribute } from '@serenity-js/web';
import { seeEventually } from '../../support/see-eventually';
import { CurrentActionEntries, CurrentActionEntry, CurrentActionsSection } from './elements';

/** The section lists exactly the actions `names`, in order (none while it is collapsed). */
export const SeeCurrentActions = (names: string[]): Task =>
  seeEventually(
    CurrentActionsSection,
    () => CurrentActionEntries.eachMappedTo(Attribute.called('data-action')),
    equals(names),
    `#actor sees the current actions ${names.length > 0 ? names.join(', ') : 'list no entries'}`,
  );

/** The entry of the action `name` is (or is not) marked running. */
export const SeeCurrentActionRunning = (name: string, running: boolean): Task =>
  seeEventually(
    CurrentActionEntry(name),
    (e) => Attribute.called('data-running').of(e),
    equals(String(running)),
    `#actor sees the current action "${name}" ${running ? 'running' : 'not running'}`,
  );

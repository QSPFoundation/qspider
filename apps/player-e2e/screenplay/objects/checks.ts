import { Task } from '@serenity-js/core';
import { endsWith, equals } from '@serenity-js/assertions';
import { Attribute, Text } from '@serenity-js/web';
import { waitUntilAbsent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { ObjectImage, ObjectNames, ObjectsPanel } from './elements';

/** The objects panel eventually lists exactly `names`, in order. */
export const SeeObjects = (names: string[]): Task =>
  seeEventually(
    ObjectsPanel,
    () => ObjectNames.eachMappedTo(Text),
    equals(names),
    `#actor sees the objects ${names.length > 0 ? names.join(', ') : '(none)'}`,
  );

/** The object named `name` shows an image whose src ends with `file`. */
export const SeeObjectImage = (name: string, file: string): Task =>
  seeEventually(
    ObjectImage(name),
    (e) => Attribute.called('src').of(e),
    endsWith(file),
    `#actor sees the "${name}" object with image "${file}"`,
  );

/** The objects panel is gone. An absence check: check a settled anchor first. */
export const SeeNoObjectsPanel = (): Task => Task.where('#actor sees no objects panel', waitUntilAbsent(ObjectsPanel));

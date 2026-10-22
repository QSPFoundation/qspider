import { By, PageElement, PageElements, Text } from '@serenity-js/web';
import { equals } from '@serenity-js/assertions';
import { visible } from '../support/visible';

/** The objects panel (qsp-objects). Not rendered at all while the game hides it (`showobjs 0`). */
export const ObjectsPanel = PageElement.located(By.css('[data-qsp="objects"]')).describedAs('objects panel');

/** The names of the listed objects, in order. */
export const ObjectNames = PageElements.located(By.css('[data-qsp="object-name"]'))
  .of(ObjectsPanel)
  .describedAs('object names');

const ObjectName = PageElement.located(By.css('[data-qsp="object-name"]')).describedAs('object name');

/** The listed object named `name`. */
export const ObjectItem = (name: string) =>
  visible(
    PageElements.located(By.css('[data-qsp="object"]')).where(Text.of(ObjectName), equals(name)),
    `"${name}" object`,
  );

/** The image of the object named `name`: an <img> rendered only when the object has an image. */
export const ObjectImage = (name: string) =>
  PageElement.located(By.css('[data-qsp="object-image"]'))
    .of(ObjectItem(name))
    .describedAs(`image of the "${name}" object`);

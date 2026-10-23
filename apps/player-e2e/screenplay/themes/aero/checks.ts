import { Expectation, Task } from '@serenity-js/core';
import { endsWith, equals, includes, matches, not } from '@serenity-js/assertions';
import { Attribute, Text } from '@serenity-js/web';
import { MainText } from '../../game/elements';
import { Menu } from '../../menu/elements';
import { waitUntilAbsent, waitUntilPresent } from '../../support/presence';
import { seeEventually } from '../../support/see-eventually';
import { SeeCssValue, SeeCssValues } from '../../support/page-script';
import { ObjectsPanel } from '../../objects/elements';
import { ActionImage, AeroMenuItems, AeroObjects, Overlay } from './elements';

const FIXED_MENU_CLASS = 'aero-fixed-menu';

export const SeeOverlay = (): Task => Task.where('#actor sees the dialog shade', waitUntilPresent(Overlay));

/** The dialog shade is gone. An absence check: check a settled anchor (the dialog itself) first. */
export const SeeNoOverlay = (): Task => Task.where('#actor sees no dialog shade', waitUntilAbsent(Overlay));

/** The menu anchor sits at (x, y) px. */
export const SeeMenuAnchorAt = (x: number, y: number): Task =>
  SeeCssValues({ qsp: 'menu-anchor' }, { left: `${x}px`, top: `${y}px` });

/** The open menu carries (fixed) or lacks the fixed-size class. Reads the class attribute; check the menu items first. */
export const SeeMenuFixed = (fixed: boolean): Task =>
  seeEventually(
    Menu,
    (e) => Attribute.called('class').of(e),
    fixed ? includes(FIXED_MENU_CLASS) : not(includes(FIXED_MENU_CLASS)),
    `#actor sees the menu ${fixed ? 'with' : 'without'} the "${FIXED_MENU_CLASS}" class`,
  );

/** The main text holds `text` at least twice (the second write is the proof that a later click went through). */
export const SeeMainTextTwice = (text: string): Task => {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return seeEventually(
    MainText,
    (e) => Text.of(e),
    matches(new RegExp(`${escaped}[\\s\\S]*${escaped}`)),
    `#actor sees main text with "${text}" twice`,
  );
};

/** The action `label` shows an image whose src ends with `file` (the action format's %IMAGE%). */
export const SeeActionImage = (label: string, file: string): Task =>
  seeEventually(
    ActionImage(label),
    (e) => Attribute.called('src').of(e),
    endsWith(file),
    `#actor sees the "${label}" action with image "${file}"`,
  );

/** The objects panel lists exactly `labels` (each object's whole text, format included). */
export const SeeAeroObjects = (labels: string[]): Task =>
  seeEventually(
    ObjectsPanel,
    () => AeroObjects.eachMappedTo(Text),
    equals(labels),
    `#actor sees the objects ${labels.join(', ')}`,
  );

/** The open menu lists exactly `labels` (each item's whole text, format included). */
export const SeeAeroMenuItems = (labels: string[]): Task =>
  seeEventually(
    Menu,
    () => AeroMenuItems.eachMappedTo(Text),
    equals(labels),
    `#actor sees the menu items ${labels.join(', ')}`,
  );

/** A computed opacity that is a number in [0, 1): the element is mid-fade, not at rest. */
const isFading = Expectation.define<string, []>('isFading', 'is mid-fade (opacity below 1)', (actual) => {
  const opacity = Number(actual);
  return actual.trim() !== '' && opacity >= 0 && opacity < 1;
});

/** The new-location effect wrapper is mid-animation. Only deterministic with a long effect time (the 60 s fade). */
export const SeeNewlocEffectInFlight = (): Task => SeeCssValue({ qsp: 'newloc-effect' }, 'opacity', isFading());

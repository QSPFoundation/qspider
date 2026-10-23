import { Task } from '@serenity-js/core';
import { includes, matches, not } from '@serenity-js/assertions';
import { Attribute, Text } from '@serenity-js/web';
import { MainText } from '../../game/elements';
import { Menu } from '../../menu/elements';
import { waitUntilAbsent, waitUntilPresent } from '../../support/presence';
import { seeEventually } from '../../support/see-eventually';
import { SeeCssValues } from '../../support/page-script';
import { Overlay } from './elements';

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
export const SeeMainTextTwice = (text: string): Task =>
  seeEventually(
    MainText,
    (e) => Text.of(e),
    matches(new RegExp(`${text}[\\s\\S]*${text}`)),
    `#actor sees main text with "${text}" twice`,
  );

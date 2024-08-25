import { atom } from 'xoid';

const edgeHasTranslation$ = atom(false);
const othersHasTranslation$ = atom(false);
export const hasBrowserTranslation$ = atom((get) => get(edgeHasTranslation$) || get(othersHasTranslation$));

const originalLanguge = document.documentElement.lang;

// Works at least for Chrome, Firefox, Safari and probably more. Not Microsoft
// Edge though.
const langObserver = new MutationObserver(() => {
  othersHasTranslation$.set(document.documentElement.lang !== originalLanguge);
});
langObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang'],
  childList: false,
  characterData: false,
});

const [title] = document.getElementsByTagName('title');
const titleObserver = new MutationObserver(() => {
  edgeHasTranslation$.set(title.hasAttribute('_msttexthash'));
});
titleObserver.observe(title, {
  attributes: true,
  attributeFilter: ['_msttexthash'],
  childList: false,
  characterData: false,
});

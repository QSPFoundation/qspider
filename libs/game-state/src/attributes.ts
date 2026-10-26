import { cleanPath } from '@qspider/utils';
import React from 'react';

export type AttributeValue = string;

const BOOLEAN_ATTRIBUTES = new Set([
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'disabled',
  'formnovalidate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'novalidate',
  'open',
  'readonly',
  'required',
  'reversed',
  'selected',
]);

type BooleanAttributes = {
  autofocus?: boolean;
  autoplay?: boolean;
  checked?: boolean;
  controls?: boolean;
  default?: boolean;
  disabled?: boolean;
  formnovalidate?: boolean;
  inert?: boolean;
  ismap?: boolean;
  itemscope?: boolean;
  loop?: boolean;
  multiple?: boolean;
  muted?: boolean;
  novalidate?: boolean;
  open?: boolean;
  readonly?: boolean;
  required?: boolean;
  reversed?: boolean;
  selected?: boolean;
};

export type EventAttributes = {
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
  onDoubleClick?: (e: MouseEvent) => void;
  onWheel?: (e: WheelEvent) => void;
  onSubmit?: (e: Event) => void;
};
export type Attributes = {
  style?: React.CSSProperties;
} & BooleanAttributes & {
    [attr: string]: AttributeValue;
  } & EventAttributes;

const SCRIPT_SCHEMES = ['javascript:', 'vbscript:', 'livescript:'];
const BLOCKED_HREF_SCHEMES = [...SCRIPT_SCHEMES, 'data:'];

/**
 * The value as the browser reads its scheme, lowercased: browsers ignore leading spaces and control characters
 * and drop tabs and newlines inside a URL (` java\tscript:` runs), so every char up to U+0020 is removed.
 * This is deliberately broader than the URL spec (which strips only leading/trailing C0 and space, and tab and
 * newline inside): a value it over-matches is one no browser would read as a safe scheme anyway.
 */
const schemeView = (value: string): string =>
  Array.from(value)
    .filter((char) => char.charCodeAt(0) > 0x20)
    .join('')
    .toLowerCase();

const startsWithAny = (scheme: string, prefixes: string[]): boolean =>
  prefixes.some((prefix) => scheme.startsWith(prefix));

type ValueProcessor = (value: string, node: HTMLElement) => string;

const blockSchemes =
  (blocked: string[], replacement: string): ValueProcessor =>
  (value) =>
    startsWithAny(schemeView(value), blocked) ? replacement : value;

// The player's own guard: React sanitises only some props (not lowercase formaction) and only javascript:.
const neutraliseLink = blockSchemes(BLOCKED_HREF_SCHEMES, '#');

// SVG <image> and <feImage> only paint their href, never navigate, so a data: picture there stays (Inkscape embeds
// pictures this way). A tag= override renders another element, so it must name one of them too.
const PICTURE_TAGS = new Set(['image', 'feimage']);
const isPictureTag = (tag: string): boolean => PICTURE_TAGS.has(tag.slice(tag.lastIndexOf(':') + 1).toLowerCase());
const neutraliseSvgLink: ValueProcessor = (value, node) =>
  isPictureTag(node.localName) &&
  isPictureTag(node.getAttribute('tag') ?? node.localName) &&
  schemeView(value).startsWith('data:image/')
    ? value
    : neutraliseLink(value, node);

/**
 * Keyed by the attribute name lowercased with `-` and `:` removed: the renderer camelCases dashed names into props
 * (`xlink-href` becomes `xlinkHref`, rendered as `xlink:href`; `form-action` becomes `formAction`), and HTML
 * attribute names are case-insensitive, so every spelling that can reach one of these attributes meets its check.
 */
const valueProcessors: Record<string, ValueProcessor> = {
  href: neutraliseSvgLink,
  xlinkhref: neutraliseSvgLink,
  formaction: neutraliseLink,
  action: neutraliseLink,
  // Games use data: images, so src keeps data: and blocks only the script schemes.
  src: blockSchemes(SCRIPT_SCHEMES, 'about:blank'),
};

const processorKey = (name: string): string => name.replace(/[-:]/g, '').toLowerCase();

const processValue = (name: string, value: string, node: HTMLElement): string => {
  const key = processorKey(name);
  return Object.prototype.hasOwnProperty.call(valueProcessors, key) ? valueProcessors[key](value, node) : value;
};

export function extractAttributes(node: HTMLElement): Attributes {
  const attributes: Attributes = {};
  Array.from(node.attributes).forEach((attr) => {
    const { name, value } = attr;
    if (name === 'is') return;
    if (name === 'style') {
      attributes['style'] = processStyles(value);
    } else if (BOOLEAN_ATTRIBUTES.has(name)) {
      attributes[name as keyof BooleanAttributes] = true;
    } else {
      attributes[name] = processValue(name, value, node);
    }
  });
  return attributes;
}

/**
 * Splits a style attribute into declarations at each `;` outside parentheses and quotes, so a `url(data:…;base64,…)`
 * or a quoted `content: 'a;b'` stays whole. A backslash escapes the next character, as in CSS.
 */
const splitDeclarations = (value: string): string[] => {
  const declarations: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '\\') {
      i++;
    } else if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    } else if (char === ';' && depth === 0) {
      declarations.push(value.slice(start, i));
      start = i + 1;
    }
  }
  declarations.push(value.slice(start));
  return declarations;
};

// Values a background-image takes as they are: `none` and the CSS-wide keywords. Anything with a `(` is a function
// (url(), a gradient, image-set(), var()) and is kept too.
const IMAGE_KEYWORDS = new Set(['none', 'inherit', 'initial', 'unset', 'revert', 'revert-layer']);

/**
 * A bare background-image path as a CSS url(): one pair of surrounding quotes dropped, backslashes turned into
 * slashes as for every resource path (in CSS `\a` is an escape), and `"` escaped so the string stays closed.
 */
const bareImageUrl = (path: string): string => {
  const unquoted = /^(["'])[\s\S]*\1$/.test(path) ? path.slice(1, -1) : path;
  return `url("${cleanPath(unquoted).replace(/"/g, '\\"')}")`;
};

/**
 * The style object React takes: names lowercased and camelCased, custom properties (`--Accent`) verbatim, plain
 * numbers as numbers. No url() scheme guard on purpose: javascript: in a CSS url() does not run in Chromium, WebKit
 * or WebView2, and a regex cannot cover CSS escapes (`java\73 cript:`).
 */
export function processStyles(styleAttribute: string): Record<string, string | number> {
  const style: Record<string, string | number> = {};
  for (const declaration of splitDeclarations(styleAttribute)) {
    const colon = declaration.indexOf(':');
    if (colon === -1) continue;
    const prop = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    if (!prop) continue;
    if (prop.startsWith('--')) {
      style[prop] = value;
      continue;
    }
    const name = prop
      .toLowerCase()
      .replace(/^-ms-/, 'ms-')
      .replace(/-./g, (c) => c.substring(1).toUpperCase());
    let preparedValue: string | number = value;
    if (name === 'backgroundImage' && value && !value.includes('(') && !IMAGE_KEYWORDS.has(value.toLowerCase())) {
      // A bare path, as classic games write it.
      preparedValue = bareImageUrl(value);
    } else if (/^[+-]?\d+(\.\d+)?$/.test(value)) {
      preparedValue = parseFloat(value);
    }
    style[name] = preparedValue;
  }
  return style;
}

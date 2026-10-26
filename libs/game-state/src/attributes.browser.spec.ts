import { describe, expect, it } from 'vitest';
import { extractAttributes, processStyles } from './attributes';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
// eslint-disable-next-line no-script-url -- the hostile input the URL guard must neutralise
const SCRIPT = "javascript:document.body.setAttribute('data-qa-pwned','1')";

/** The first element `selector` matches in `html`, parsed by the browser as game text is. */
function parse(html: string, selector = '*'): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html;
  const node = template.content.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`no ${selector} in ${html}`);
  return node;
}

/** An element whose attribute `name` is set to `value` verbatim (control characters included). */
function withAttribute(tag: string, name: string, value: string): HTMLElement {
  const node = document.createElement(tag);
  node.setAttribute(name, value);
  return node;
}

describe('extractAttributes: URL attributes', () => {
  it('turns a script URL in href, formaction, action and xlink:href into #', () => {
    expect(extractAttributes(withAttribute('a', 'href', SCRIPT))).toEqual({ href: '#' });
    expect(extractAttributes(withAttribute('button', 'formaction', SCRIPT))).toEqual({ formaction: '#' });
    expect(extractAttributes(withAttribute('form', 'action', SCRIPT))).toEqual({ action: '#' });
    expect(extractAttributes(parse(`<svg><a xlink:href="${SCRIPT}"></a></svg>`, 'a'))).toEqual({ 'xlink:href': '#' });
  });

  it('reads the scheme case-insensitively', () => {
    // eslint-disable-next-line no-script-url -- the hostile input the URL guard must neutralise
    expect(extractAttributes(withAttribute('a', 'href', 'JavaScript:alert(1)'))).toEqual({ href: '#' });
    expect(extractAttributes(withAttribute('a', 'href', 'VBSCRIPT:x'))).toEqual({ href: '#' });
    expect(extractAttributes(withAttribute('a', 'href', 'LiveScript:x'))).toEqual({ href: '#' });
  });

  it('reads the scheme past leading spaces and control characters and through tabs and newlines inside it', () => {
    expect(extractAttributes(withAttribute('a', 'href', ' java\tscript:alert(1)'))).toEqual({ href: '#' });
    expect(extractAttributes(withAttribute('button', 'formaction', '\u0001java\nscript:alert(1)'))).toEqual({
      formaction: '#',
    });
    expect(extractAttributes(withAttribute('a', 'href', '\u0000\u001fjavascript\r:alert(1)'))).toEqual({ href: '#' });
  });

  it('turns a data: URL in a link into #', () => {
    expect(extractAttributes(withAttribute('a', 'href', 'data:text/html,<script>x</script>'))).toEqual({ href: '#' });
    expect(extractAttributes(withAttribute('a', 'href', ' DATA:text/html,x'))).toEqual({ href: '#' });
  });

  it('keeps an ordinary link, an exec link and a fragment', () => {
    expect(extractAttributes(withAttribute('a', 'href', "exec:gt 'room'"))).toEqual({ href: "exec:gt 'room'" });
    expect(extractAttributes(withAttribute('a', 'href', 'https://example.com/a?b=c'))).toEqual({
      href: 'https://example.com/a?b=c',
    });
    expect(extractAttributes(withAttribute('a', 'href', '#m'))).toEqual({ href: '#m' });
  });

  it('turns a script URL in src into about:blank', () => {
    expect(extractAttributes(withAttribute('img', 'src', SCRIPT))).toEqual({ src: 'about:blank' });
    expect(extractAttributes(withAttribute('img', 'src', ' Java\tScript:x'))).toEqual({ src: 'about:blank' });
  });

  it('keeps a data: picture and a relative path in src', () => {
    expect(extractAttributes(withAttribute('img', 'src', PNG))).toEqual({ src: PNG });
    expect(extractAttributes(withAttribute('img', 'src', 'img/room.png'))).toEqual({ src: 'img/room.png' });
  });

  it('keeps a data: picture on svg image and feImage, by href and xlink:href', () => {
    expect(extractAttributes(parse(`<svg><image xlink:href="${PNG}"/></svg>`, 'image'))).toEqual({
      'xlink:href': PNG,
    });
    expect(extractAttributes(parse(`<svg><image href="${PNG}"/></svg>`, 'image'))).toEqual({ href: PNG });
    expect(extractAttributes(parse(`<svg><filter><feImage href="${PNG}"/></filter></svg>`, 'feImage'))).toEqual({
      href: PNG,
    });
  });

  it('turns a data: URL that is not a picture on svg image into #', () => {
    expect(extractAttributes(parse('<svg><image href="data:text/html,x"/></svg>', 'image'))).toEqual({ href: '#' });
    expect(extractAttributes(parse(`<svg><image href="${SCRIPT}"/></svg>`, 'image'))).toEqual({ href: '#' });
  });

  it('turns a data: picture on a navigating svg link into #', () => {
    expect(extractAttributes(parse(`<svg><a xlink:href="${PNG}"></a></svg>`, 'a'))).toEqual({ 'xlink:href': '#' });
  });

  it('keeps an svg picture data: href only when a tag= override names a picture tag too', () => {
    expect(extractAttributes(parse(`<svg><image tag="feImage" href="${PNG}"/></svg>`, 'image'))).toEqual({
      tag: 'feImage',
      href: PNG,
    });
    expect(extractAttributes(parse(`<svg><image tag="svg:image" href="${PNG}"/></svg>`, 'image'))).toEqual({
      tag: 'svg:image',
      href: PNG,
    });
    expect(extractAttributes(parse(`<svg><image tag="a" href="${PNG}"/></svg>`, 'image'))).toEqual({
      tag: 'a',
      href: '#',
    });
    expect(extractAttributes(parse(`<b tag="image" href="${PNG}">x</b>`, 'b'))).toEqual({ tag: 'image', href: '#' });
  });

  it('meets every spelling that reaches a URL prop: dashed, colon and upper-case names', () => {
    expect(extractAttributes(withAttribute('button', 'form-action', SCRIPT))).toEqual({ 'form-action': '#' });
    expect(extractAttributes(parse(`<svg><a xlink-href="${SCRIPT}"></a></svg>`, 'a'))).toEqual({ 'xlink-href': '#' });
    expect(extractAttributes(parse(`<svg><a XLINK:HREF="${SCRIPT}"></a></svg>`, 'a'))).toEqual({ 'xlink:href': '#' });
    expect(extractAttributes(withAttribute('img', 's-r-c', SCRIPT))).toEqual({ 's-r-c': 'about:blank' });
  });
});

describe('extractAttributes: names', () => {
  it('keeps names that are Object.prototype members as plain values, without touching the prototype', () => {
    const node = document.createElement('div');
    node.setAttribute('constructor', 'c');
    node.setAttribute('tostring', 't');
    node.setAttribute('__proto__', SCRIPT);
    const attributes = extractAttributes(node);
    expect(Object.getPrototypeOf(attributes)).toBe(Object.prototype);
    expect(Object.keys(attributes)).toEqual(['constructor', 'tostring']);
    expect(attributes['constructor']).toBe('c');
    expect(attributes['tostring']).toBe('t');
  });

  it('gives true for a boolean attribute that is present, whatever its value', () => {
    expect(extractAttributes(parse('<input disabled checked="false" readonly="">'))).toEqual({
      disabled: true,
      checked: true,
      readonly: true,
    });
    expect(extractAttributes(parse('<details open><summary>s</summary></details>'))).toEqual({ open: true });
  });

  it('drops the is attribute', () => {
    expect(extractAttributes(parse('<b is="x-evil" class="c">x</b>'))).toEqual({ class: 'c' });
  });

  it('parses the style attribute into a style object', () => {
    expect(extractAttributes(parse('<b style="color: red" data-x="1">x</b>'))).toEqual({
      style: { color: 'red' },
      'data-x': '1',
    });
  });
});

describe('processStyles', () => {
  it('camelCases dashed property names', () => {
    expect(processStyles('font-size:12px;background-color:#fff')).toEqual({
      fontSize: '12px',
      backgroundColor: '#fff',
    });
  });

  it('maps the -ms- prefix to ms and other vendor prefixes to a capital', () => {
    expect(processStyles('-ms-transform:rotate(1deg);-webkit-box-shadow:none')).toEqual({
      msTransform: 'rotate(1deg)',
      WebkitBoxShadow: 'none',
    });
  });

  it('keeps a data: URL whole, with its ; and :', () => {
    expect(processStyles('background-image:url(data:image/png;base64,AA);color:red')).toEqual({
      backgroundImage: 'url(data:image/png;base64,AA)',
      color: 'red',
    });
  });

  it('keeps a quoted data: URL whole', () => {
    expect(processStyles('background:url("data:image/png;base64,AA") no-repeat')).toEqual({
      background: 'url("data:image/png;base64,AA") no-repeat',
    });
    expect(processStyles("content:'a;b:c';color:red")).toEqual({ content: "'a;b:c'", color: 'red' });
  });

  it('keeps an absolute URL whole', () => {
    expect(processStyles('background-image:url(http://x/y.png)')).toEqual({ backgroundImage: 'url(http://x/y.png)' });
  });

  it('keeps a custom property name verbatim', () => {
    expect(processStyles('--accent:red;--main-bg-color: #123')).toEqual({
      '--accent': 'red',
      '--main-bg-color': '#123',
    });
  });

  it('keeps a custom property value as text', () => {
    expect(processStyles('--size:10')).toEqual({ '--size': '10' });
  });

  it('skips a declaration with no colon instead of throwing', () => {
    expect(processStyles('background-image')).toEqual({});
    expect(processStyles('color:red;bogus;width:5px')).toEqual({ color: 'red', width: '5px' });
  });

  it('skips empty declarations', () => {
    expect(Object.keys(processStyles('color:red;;'))).toEqual(['color']);
    expect(Object.keys(processStyles(''))).toEqual([]);
  });

  it('wraps a bare background-image path in url()', () => {
    expect(processStyles('background-image: img/a.png')).toEqual({ backgroundImage: 'url("img/a.png")' });
  });

  it('does not wrap a gradient, a url() list or a keyword in url()', () => {
    expect(processStyles('background-image:linear-gradient(red, blue)')).toEqual({
      backgroundImage: 'linear-gradient(red, blue)',
    });
    expect(processStyles('background-image:url(a.png), url(b.png)')).toEqual({
      backgroundImage: 'url(a.png), url(b.png)',
    });
    expect(processStyles('background-image:none')).toEqual({ backgroundImage: 'none' });
    expect(processStyles('background-image:inherit')).toEqual({ backgroundImage: 'inherit' });
  });

  it('trims names and values', () => {
    expect(processStyles('  color :  red  ')).toEqual({ color: 'red' });
  });

  it('turns a plain number into a number', () => {
    expect(processStyles('width: 10;opacity:0.5;z-index:-2')).toEqual({ width: 10, opacity: 0.5, zIndex: -2 });
  });

  it('keeps a number with a unit as text', () => {
    expect(processStyles('width:10px')).toEqual({ width: '10px' });
  });

  it('splits the value at the first colon only', () => {
    expect(processStyles('font-family:a:b')).toEqual({ fontFamily: 'a:b' });
  });
});

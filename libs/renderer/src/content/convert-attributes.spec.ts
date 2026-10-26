import type { Attributes } from '@qspider/game-state';
import { describe, expect, it } from 'vitest';
import { attributesToStyle, convertAttributes, isDroppedTag, localTagName } from './convert-attributes';

describe('attributesToStyle', () => {
  it('adds px to a bare number and keeps a percentage', () => {
    expect(attributesToStyle({ width: '100', height: '50%' }, 'div')).toEqual({ width: '100px', height: '50%' });
  });

  it('turns font size steps into CSS size keywords', () => {
    expect(attributesToStyle({ size: '+1' }, 'font')).toEqual({ fontSize: 'large' });
    expect(attributesToStyle({ size: '3' }, 'font')).toEqual({ fontSize: 'medium' });
  });

  it('maps bgcolor, valign and color to CSS properties', () => {
    expect(attributesToStyle({ bgcolor: 'red', valign: 'top', color: '#fff' }, 'td')).toEqual({
      backgroundColor: 'red',
      verticalAlign: 'top',
      color: '#fff',
    });
  });

  it('ignores an empty color', () => {
    expect(attributesToStyle({ color: '' }, 'font')).toEqual({});
  });

  it('maps an image align value to vertical-align', () => {
    expect(attributesToStyle({ align: 'AbsCenter' }, 'img')).toEqual({ verticalAlign: 'middle' });
  });

  it('ignores align on other tags', () => {
    expect(attributesToStyle({ align: 'center' }, 'div')).toEqual({});
  });

  it('maps <font face> to the font-family property', () => {
    expect(attributesToStyle({ face: 'Arial' }, 'font')).toEqual({ fontFamily: 'Arial' });
  });
});

describe('convertAttributes', () => {
  it('renames HTML attributes to their React props', () => {
    const { props } = convertAttributes({ class: 'box', colspan: '2', 'stroke-width': '3' }, 'td');
    expect(props).toEqual({ className: 'box', colSpan: '2', strokeWidth: '3' });
  });

  it('keeps an attribute named like an Object.prototype member as written', () => {
    const { props } = convertAttributes({ constructor: 'y' }, 'i');
    expect(props).toEqual({ constructor: 'y' });
  });

  it('keeps aria-, data- and mask-type attributes as written', () => {
    const { props } = convertAttributes({ 'aria-label': 'Close', 'data-x': '1', 'mask-type': 'alpha' }, 'div');
    expect(props).toEqual({ 'aria-label': 'Close', 'data-x': '1', 'mask-type': 'alpha' });
  });

  it('drops inline onclick handlers', () => {
    const { props, events } = convertAttributes({ onclick: "alert('x')" }, 'a');
    expect(props).toEqual({});
    expect(events).toEqual([]);
  });

  it('turns qsp-on:click into a click event with the exec: prefix cut', () => {
    const { props, events } = convertAttributes({ 'qsp-on:click': "exec:gt 'x'" }, 'div');
    expect(events).toEqual([{ prop: 'onClick', code: "gt 'x'" }]);
    expect(props).toEqual({});
  });

  it('ignores qsp-on events the player does not support', () => {
    expect(convertAttributes({ 'qsp-on:foo': 'exec:gt 1' }, 'div').events).toEqual([]);
  });

  it('turns qsp-on:wheel into a wheel event', () => {
    const { events } = convertAttributes({ 'qsp-on:wheel': "exec:gt 'scroll'" }, 'div');
    expect(events).toEqual([{ prop: 'onWheel', code: "gt 'scroll'" }]);
  });

  it('marks a qsp- element with data-qsp from its data name', () => {
    expect(convertAttributes({}, 'div', 'qsp-main').props['data-qsp']).toBe('main');
  });

  it('does not add data-qsp for a plain tag', () => {
    expect(convertAttributes({}, 'div').props).toEqual({});
  });

  it('keeps class on a custom element tag', () => {
    const { props } = convertAttributes({ class: 'box' }, 'qsp-x');
    expect(props).toEqual({ 'data-qsp': 'x', class: 'box' });
  });

  it('forces the iframe sandbox even when the game set it empty', () => {
    const { props } = convertAttributes({ sandbox: '', src: 'a.html' }, 'iframe');
    expect(props).toEqual({ sandbox: 'allow-scripts', src: 'a.html' });
  });

  it('lets a tag attribute override the tag', () => {
    expect(convertAttributes({ tag: 'section' }, 'div').tag).toBe('section');
  });

  it('lets attribute styles win over the style object', () => {
    const attributes = { style: { color: 'red', margin: '1px' }, color: 'blue' } as unknown as Attributes;
    const { style } = convertAttributes(attributes, 'font');
    expect(style).toEqual({ color: 'blue', margin: '1px' });
  });

  it('reads qsp-command as a game command', () => {
    const { command, props } = convertAttributes({ 'qsp-command': 'save' }, 'button');
    expect(command).toEqual({ kind: 'game', value: 'save' });
    expect(props['data-qsp-command']).toBe('save');
  });

  it('reads qsp-save-command as a save command', () => {
    const { command, props } = convertAttributes({ 'qsp-save-command': 'load' }, 'button');
    expect(command).toEqual({ kind: 'save', value: 'load' });
    expect(props['data-qsp-save-command']).toBe('load');
  });

  it('has no command by default', () => {
    expect(convertAttributes({}, 'div').command).toBeNull();
  });

  it('sandboxes an iframe a tag attribute names in any case', () => {
    const { tag, props, dropped } = convertAttributes({ tag: 'IFRAME', srcdoc: '<b>x</b>' }, 'b');
    expect(tag).toBe('iframe');
    expect(props).toEqual({ srcdoc: '<b>x</b>', sandbox: 'allow-scripts' });
    expect(dropped).toBe(false);
  });

  it('drops a base a tag attribute names', () => {
    const { tag, dropped } = convertAttributes({ tag: 'base', href: 'https://example.invalid/' }, 'br');
    expect(tag).toBe('base');
    expect(dropped).toBe(true);
  });

  it('drops a script a tag attribute names in mixed case', () => {
    const { tag, dropped } = convertAttributes({ tag: 'Script', src: 'x.js', async: 'true' }, 'qsp-main');
    expect(tag).toBe('script');
    expect(dropped).toBe(true);
  });

  it('keeps the camelCase name of an SVG tag a tag attribute names', () => {
    const { tag, dropped } = convertAttributes({ tag: 'clipPath', id: 'c' }, 'g');
    expect(tag).toBe('clipPath');
    expect(dropped).toBe(false);
  });

  it('maps a parsed lowercase SVG tag to its camelCase name', () => {
    expect(convertAttributes({}, 'foreignobject').tag).toBe('foreignObject');
  });

  it('keeps a tag named like an object property as written', () => {
    expect(convertAttributes({ tag: 'constructor' }, 'b').tag).toBe('constructor');
  });

  it('drops a namespaced script a tag attribute names', () => {
    const { tag, dropped } = convertAttributes({ tag: 'svg:script' }, 'g');
    expect(tag).toBe('svg:script');
    expect(dropped).toBe(true);
  });

  it('drops a namespaced script the parser gives', () => {
    expect(convertAttributes({}, 'svg:script').dropped).toBe(true);
  });

  it('sandboxes a namespaced iframe', () => {
    const { props, dropped } = convertAttributes({ tag: 'xlink:IFRAME' }, 'b');
    expect(props).toEqual({ sandbox: 'allow-scripts' });
    expect(dropped).toBe(false);
  });

  it('keeps clipPath and foreignObject unsandboxed and not dropped', () => {
    for (const name of ['clipPath', 'foreignObject']) {
      const { tag, props, dropped } = convertAttributes({ tag: name }, 'g');
      expect(tag).toBe(name);
      expect(props).toEqual({});
      expect(dropped).toBe(false);
    }
  });

  it('does not drop an ordinary tag', () => {
    expect(convertAttributes({ tag: 'div' }, 'qsp-main').dropped).toBe(false);
  });
});

describe('isDroppedTag', () => {
  it('drops each tag that runs code, redirects or embeds, in any case', () => {
    for (const tag of ['script', 'base', 'meta', 'embed', 'object', 'applet', 'frame', 'frameset', 'command']) {
      expect(isDroppedTag(tag), tag).toBe(true);
      expect(isDroppedTag(tag.toUpperCase()), tag.toUpperCase()).toBe(true);
    }
  });

  it('drops a namespaced dropped tag by its local name', () => {
    expect(isDroppedTag('svg:script')).toBe(true);
    expect(isDroppedTag('a:b:SCRIPT')).toBe(true);
    expect(isDroppedTag('script:g')).toBe(false);
  });

  it('keeps the tags games style themselves with', () => {
    for (const tag of ['style', 'link', 'title', 'iframe', 'div']) {
      expect(isDroppedTag(tag), tag).toBe(false);
    }
  });
});

describe('localTagName', () => {
  it('reads the part after the last colon, lowercased', () => {
    expect(localTagName('svg:Script')).toBe('script');
    expect(localTagName('a:b:iframe')).toBe('iframe');
  });

  it('lowercases a name without a prefix', () => {
    expect(localTagName('clipPath')).toBe('clippath');
  });
});

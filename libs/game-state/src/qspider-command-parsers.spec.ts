import { describe, expect, it } from 'vitest';
import { parseArgs, parseEvent, parseScrollRegion, parseSystemCmd, scrollStep } from './qspider-command-parsers';

// The strings below are the ones modules/qspider.qsps sends through `exec('qspider.<command>')`.

describe('parseSystemCmd', () => {
  it('keeps the command after qspider. for every helper of the qspider module', () => {
    expect(parseSystemCmd('qspider.change_theme:e2e-custom')).toBe('change_theme:e2e-custom');
    expect(parseSystemCmd('qspider.change_theme:qspider:classic')).toBe('change_theme:qspider:classic');
    expect(parseSystemCmd('qspider.update_region:reg')).toBe('update_region:reg');
    expect(parseSystemCmd('qspider.scroll_region:reg:top')).toBe('scroll_region:reg:top');
    expect(parseSystemCmd('qspider.update_layer:lay')).toBe('update_layer:lay');
    expect(parseSystemCmd('qspider.update_layers')).toBe('update_layers');
    expect(parseSystemCmd('qspider.action:toggle-mute')).toBe('action:toggle-mute');
    expect(parseSystemCmd('qspider.action:pause:saves')).toBe('action:pause:saves');
    expect(parseSystemCmd('qspider.action:scroll:main:bottom')).toBe('action:scroll:main:bottom');
    expect(parseSystemCmd('qspider.event: e2e_event[~A~,7]')).toBe('event: e2e_event[~A~,7]');
    expect(parseSystemCmd('qspider.fullscreen:on')).toBe('fullscreen:on');
  });

  it('keeps a dot inside an event argument (D11)', () => {
    expect(parseSystemCmd('qspider.event:x[1.5]')).toBe('event:x[1.5]');
    expect(parseSystemCmd('qspider.event: e2e_dotted[~1.5~,~a]b~]')).toBe('event: e2e_dotted[~1.5~,~a]b~]');
  });

  it('keeps a dot inside a theme name (D11)', () => {
    expect(parseSystemCmd('qspider.change_theme:my.theme')).toBe('change_theme:my.theme');
  });

  it('gives nothing for a bare qspider (D11)', () => {
    expect(parseSystemCmd('qspider')).toBeNull();
  });

  it('gives nothing for a command that is not a qspider one', () => {
    expect(parseSystemCmd('player.fullscreen:on')).toBeNull();
    expect(parseSystemCmd('')).toBeNull();
  });
});

describe('parseEvent', () => {
  it('reads the name and arguments qspider_event sends', () => {
    expect(parseEvent(' e2e_event[~A~,7]')).toEqual({ name: 'e2e_event', args: ['A', 7] });
  });

  it('reads an event with no arguments as a bare name', () => {
    expect(parseEvent(' res_start')).toEqual({ name: 'res_start' });
    expect(parseEvent('res_xhr')).toEqual({ name: 'res_xhr' });
  });

  it('reads empty brackets as no arguments', () => {
    expect(parseEvent('e[]')).toEqual({ name: 'e', args: [] });
  });

  it('keeps a ] inside a string argument (D13)', () => {
    expect(parseEvent('e[~a]b~,2]')).toEqual({ name: 'e', args: ['a]b', 2] });
  });

  it('keeps a dot and a ] in the string arguments qspider_event sends (D13)', () => {
    expect(parseEvent(' e2e_dotted[~1.5~,~a]b~]')).toEqual({ name: 'e2e_dotted', args: ['1.5', 'a]b'] });
  });

  it('reads an unclosed [ as part of the name', () => {
    expect(parseEvent('e[1')).toEqual({ name: 'e[1' });
  });

  it('ignores the text after the last ]', () => {
    expect(parseEvent('e[1]tail')).toEqual({ name: 'e', args: [1] });
    // The arguments run to the last ], so `1]x[2` is one bare token, which reads as 1.
    expect(parseEvent('e[1]x[2]')).toEqual({ name: 'e', args: [1] });
  });
});

describe('parseArgs', () => {
  it('reads ~text~ as a string and a bare token as a number', () => {
    expect(parseArgs('~A~,7')).toEqual(['A', 7]);
    expect(parseArgs('-5,~x~,0')).toEqual([-5, 'x', 0]);
  });

  it('keeps commas and spaces inside a string', () => {
    expect(parseArgs('~a, b~,1')).toEqual(['a, b', 1]);
  });

  it('reads an empty string argument', () => {
    expect(parseArgs('~~,1')).toEqual(['', 1]);
  });

  it('ignores spaces around numbers and empty slots between commas', () => {
    expect(parseArgs(' 1 , ,2 ')).toEqual([1, 2]);
    expect(parseArgs('')).toEqual([]);
  });

  it('keeps an unclosed ~ string as a string (D13)', () => {
    expect(parseArgs('~abc')).toEqual(['abc']);
    expect(parseArgs('~12')).toEqual(['12']);
    expect(parseArgs('1,~a,b')).toEqual([1, 'a,b']);
  });

  it('reads text right after a closing ~ as its own argument (D13)', () => {
    expect(parseArgs('~a~x')).toEqual(['a', 'x']);
    expect(parseArgs('~a~~b~')).toEqual(['a', 'b']);
    expect(parseArgs('~a~ 3')).toEqual(['a', 3]);
  });

  it('keeps a bare token that is not a number as a string (D13)', () => {
    expect(parseArgs('abc,1')).toEqual(['abc', 1]);
  });

  it('reads a bare token with parseFloat, as before D13', () => {
    expect(parseArgs('12abc')).toEqual([12]);
    expect(parseArgs('0x10')).toEqual([0]);
    expect(parseArgs('1.5')).toEqual([1.5]);
  });

  it('keeps a bare token parseFloat cannot read as text (D13)', () => {
    expect(parseArgs('-')).toEqual(['-']);
    expect(parseArgs('~a~x')).toEqual(['a', 'x']);
  });
});

describe('parseScrollRegion', () => {
  it('reads the region and the direction', () => {
    expect(parseScrollRegion('reg:top')).toEqual({ name: 'reg', direction: 'top' });
    expect(parseScrollRegion('reg:bottom')).toEqual({ name: 'reg', direction: 'bottom' });
  });

  it('keeps a : inside the region name', () => {
    expect(parseScrollRegion('my:reg:top')).toEqual({ name: 'my:reg', direction: 'top' });
  });

  it('reads a region with no direction', () => {
    expect(parseScrollRegion('reg')).toEqual({ name: 'reg', direction: undefined });
  });
});

describe('scrollStep', () => {
  it('scrolls to the top on top', () => {
    expect(scrollStep(3, 'top')).toBe(-1);
    expect(scrollStep(undefined, 'top')).toBe(-1);
  });

  it('asks for one more scroll to the bottom on any other direction', () => {
    expect(scrollStep(0, 'bottom')).toBe(1);
    expect(scrollStep(2, 'bottom')).toBe(3);
    expect(scrollStep(2, undefined)).toBe(3);
  });

  it('starts a region that never scrolled at the first scroll to the bottom', () => {
    expect(scrollStep(undefined, 'bottom')).toBe(1);
  });

  it('counts a scroll to the bottom after a scroll to the top as the first one', () => {
    expect(scrollStep(-1, 'bottom')).toBe(1);
  });
});

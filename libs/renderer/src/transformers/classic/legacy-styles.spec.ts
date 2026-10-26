import { describe, expect, it } from 'vitest';
import { fontSizeStyle, hrStyle, tableClassName, tableStyle } from './legacy-styles';

describe('hrStyle', () => {
  it('draws a plain <hr> as an inset top line', () => {
    expect(hrStyle(null, null, false)).toEqual({
      borderWidth: '1px 0 0 0',
      borderStyle: 'inset',
      borderColor: 'rgb(128, 128, 128)',
      borderRadius: '1px',
      height: '0px',
      margin: '0.5em auto',
      width: '100%',
      backgroundColor: 'transparent',
    });
  });

  it('draws <hr width="50%" size="3" noshade> as a solid grey bar', () => {
    expect(hrStyle('50%', '3', true)).toEqual({
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgb(128, 128, 128)',
      borderRadius: '1px',
      height: '3px',
      margin: '0.5em auto',
      width: '50%',
      backgroundColor: 'rgb(128, 128, 128)',
    });
  });
});

describe('tableStyle', () => {
  it('aligns top left with zero border, spacing and padding by default', () => {
    expect(tableStyle({ border: 0, cellspacing: 0, cellpadding: 0 })).toEqual({
      textAlign: 'left',
      verticalAlign: 'top',
      '--table-border-width': '0px',
      '--table-cellspacing': '0px',
      '--table-cellpadding': '0px',
    });
  });

  it('turns <table border="2"> into a 2px border width', () => {
    expect(tableStyle({ border: 2, cellspacing: 0, cellpadding: 0 })).toMatchObject({
      '--table-border-width': '2px',
    });
  });
});

describe('tableClassName', () => {
  it('uses the classic-table class alone by default', () => {
    expect(tableClassName(undefined)).toBe('classic-table');
  });

  it('appends classic-table to an existing class', () => {
    expect(tableClassName('x')).toBe('x classic-table');
  });
});

describe('fontSizeStyle', () => {
  it('inherits when <font> has no size', () => {
    expect(fontSizeStyle(null)).toBe('inherit');
  });

  it('maps a relative size to a keyword', () => {
    expect(fontSizeStyle('+2')).toBe('x-large');
  });

  it('maps an absolute size to a keyword', () => {
    expect(fontSizeStyle('9')).toBe('medium');
  });
});

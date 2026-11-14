import { describe, expect, it } from 'vitest';
import { actionOrigin, codeLinesOf, isActionStep, isLocationStep, placeStep, settleRun } from './action-run';
import type { DebugRecord } from './debug';

const record = (over: Partial<DebugRecord> = {}): DebugRecord => ({
  code: 'x = 1',
  loc: 'start',
  line: 1,
  actIndex: -1,
  ...over,
});

describe('codeLinesOf', () => {
  it('splits on both line endings', () => {
    expect(codeLinesOf('a\r\nb\nc')).toEqual(['a', 'b', 'c']);
  });
});

describe('actionOrigin', () => {
  it('is placed when every action line sits in the same location line', () => {
    expect(
      actionOrigin(
        ['', '', 'PLACED = 1', "*PL 'PLACED DONE'"],
        ['ACT1', "ACT 'placed':", 'PLACED = 1', "*PL 'PLACED DONE'"],
      ),
    ).toBe('placed');
  });
  it('is placed for an inline act (code after the colon, leading space)', () => {
    expect(actionOrigin(['', " PL 'x'"], ['X = 1', "ACT 'x': PL 'x'"])).toBe('placed');
  });
  it('is detached when one line differs even if another coincides', () => {
    expect(actionOrigin([` GT "room"`, 'Y = 2'], [`$D = 'act "go": GT "room"'`, 'DYNAMIC $D'])).toBe('detached');
  });
  it('compares a multi-line statement line by line', () => {
    const lines = ['', "$NOTE = 'two", "lines'"];
    expect(actionOrigin(lines, ['ACT 1', "$NOTE = 'two", "lines'"])).toBe('placed');
    expect(actionOrigin(lines, ['ACT 1', 'X = 1', 'Y = 2'])).toBe('detached');
  });
  it('is placed for an action with no code', () => {
    expect(actionOrigin([], ['X = 1'])).toBe('placed');
  });
});

describe('isActionStep', () => {
  const lines = ['', 'A = 1', '  B = 2', 'C = 3'];
  it('matches a line of the saved action at its number', () => {
    expect(isActionStep(record({ code: 'A = 1', line: 2 }), lines)).toBe(true);
  });
  it('matches several lines, trimmed', () => {
    expect(isActionStep(record({ code: 'B = 2\r\n  C = 3', line: 3 }), lines)).toBe(true);
  });
  it('does not match other code at that number', () => {
    expect(isActionStep(record({ code: 'A = 2', line: 2 }), lines)).toBe(false);
  });
  it('does not match past the saved lines', () => {
    expect(isActionStep(record({ code: 'C = 3\nD = 4', line: 4 }), lines)).toBe(false);
  });
  it('is false for line 0', () => {
    expect(isActionStep(record({ code: '', line: 0 }), [''])).toBe(false);
  });
});

describe('isLocationStep', () => {
  const lines = ['ACT1', "ACT 'go': GT 'acts'", '  Y = 2', "*PL 'done'"];
  it('is true when the step is contained in the location line', () => {
    expect(isLocationStep(record({ code: "GT 'acts'", line: 2 }), lines)).toBe(true);
  });
  it('is true for several contained lines, trimmed', () => {
    expect(isLocationStep(record({ code: "Y = 2\r\n *PL 'done'", line: 3 }), lines)).toBe(true);
  });
  it('is false when a line is not contained', () => {
    expect(isLocationStep(record({ code: 'OTHER', line: 3 }), lines)).toBe(false);
  });
  it('is true for the entry step at line 0', () => {
    expect(isLocationStep(record({ code: '', line: 0 }), lines)).toBe(true);
  });
});

describe('settleRun', () => {
  it('takes the location from the first step, not the current location', () => {
    const run = { index: 0, name: 'a', lines: ['', 'Z = 3'], loc: null, origin: null, locationLines: null };
    expect(settleRun(run, record({ loc: 'other', line: 2, code: 'Z = 3' }), ['GS 1', 'Z = 3'])).toEqual({
      ...run,
      loc: 'other',
      origin: 'placed',
      locationLines: ['GS 1', 'Z = 3'],
    });
  });
  it('keeps a settled run', () => {
    const run = { index: 0, name: 'a', lines: ['X'], loc: 'start', origin: 'detached' as const, locationLines: [] };
    expect(settleRun(run, record({ loc: 'other' }), [])).toBe(run);
  });
});

describe('placeStep', () => {
  const detached = {
    index: 1,
    name: 'detached',
    lines: ['', '', 'DETACHED = 1', "$NOTE = 'two", "lines'"],
    loc: 'acts',
    origin: 'detached' as const,
    locationLines: ['ACT1', 'X = 1', 'Y = 2'],
  };
  it('is location without a run', () => expect(placeStep(record({ loc: 'acts', line: 3 }), null)).toBe('location'));
  it('is location for a placed run', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: 'X' }), { ...detached, origin: 'placed' })).toBe('location'));
  it('is location for a base action step', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: 'DETACHED = 1', actIndex: 0 }), detached)).toBe('location'));
  it('is location in another location (a gs from the action)', () =>
    expect(placeStep(record({ loc: 'helper', line: 3, code: 'DETACHED = 1' }), detached)).toBe('location'));
  it('is action when the step is the saved line', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: ' DETACHED = 1' }), detached)).toBe('action'));
  it('is action for a whole multi-line statement', () =>
    expect(placeStep(record({ loc: 'acts', line: 4, code: "$NOTE = 'two\r\nlines'" }), detached)).toBe('action'));
  it('is code when nothing matches', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: 'OTHER' }), detached)).toBe('code'));
  it('is location for a line of the location (a gt back into it)', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: 'Y = 2' }), detached)).toBe('location'));
  it('is action when the step is both an action line and a location line', () =>
    expect(placeStep(record({ loc: 'acts', line: 3, code: 'Y = 2' }), { ...detached, lines: ['', '', 'Y = 2'] })).toBe(
      'action',
    ));
  it('is location for the entry step at line 0', () =>
    expect(placeStep(record({ loc: 'acts', line: 0, code: '' }), detached)).toBe('location'));
});

import { describe, expect, it } from 'vitest';
import { monaco } from './monaco-setup';
import { hoverTargetAt, qspLineTokens } from './qsp-tokens';

/** Hovers the first occurrence of `word` (on line `lineNo`, 1-based) in `text`, tokenizing the whole text. */
function hover(text: string, word: string, lineNo = 1) {
  const model = monaco.editor.createModel(text, 'qsp');
  try {
    const line = model.getLineContent(lineNo);
    return hoverTargetAt(line, qspLineTokens(model, lineNo, 'qsp'), line.indexOf(word));
  } finally {
    model.dispose();
  }
}

describe('hoverTargetAt', () => {
  it('walks left over fields, the index and the base name', () => {
    expect(hover("A['K'].B.C = 1", 'C')?.target).toEqual({ name: 'A', indexText: "'K'", fields: ['B', 'C'] });
    expect(hover("A['K'].B.C = 1", 'B')?.target).toEqual({ name: 'A', indexText: "'K'", fields: ['B'] });
  });

  it('gives the base without fields', () => {
    expect(hover("A['K'].B.C = 1", 'A')?.target).toEqual({ name: 'A', indexText: "'K'", fields: [] });
    expect(hover('GOLD = 1', 'GOLD')?.target).toEqual({ name: 'GOLD', indexText: undefined, fields: [] });
  });

  it('reads prefixed and quoted fields', () => {
    expect(hover('$P.$NAME = 1', '$NAME')?.target).toEqual({ name: '$P', indexText: undefined, fields: ['$NAME'] });
    const found = hover("A.'SOME FIELD' = 1", "'SOME FIELD'");
    expect(found?.target).toEqual({ name: 'A', indexText: undefined, fields: ["'SOME FIELD'"] });
    expect(found?.start).toBe(2);
    expect(found?.end).toBe(14);
  });

  it('joins a quoted field split by an escaped quote', () => {
    for (const word of ["'IT", "S'"]) {
      expect(hover("A.'IT''S' = 1", word)?.target.fields).toEqual(["'IT''S'"]);
    }
    expect(hover("A.'IT''S' = 1", "S'")).toMatchObject({ start: 2, end: 9 });
  });

  it('gives null for tokens that are not variables', () => {
    expect(hover('[NAME: 1]', 'NAME')).toBeNull();
    expect(hover(':LABEL1', 'LABEL1')).toBeNull();
    expect(hover("X = $MID('a', 1)", '$MID')).toBeNull();
  });

  it('reads a name inside <<…>>', () => {
    expect(hover("X = 'x <<GOLD>> y'", 'GOLD')?.target.name).toBe('GOLD');
  });

  it('reads a name inside <<…>> on the second line of a string', () => {
    expect(hover("X = 'a\n<<GOLD>>'", 'GOLD', 2)?.target.name).toBe('GOLD');
  });

  it('accepts the caret just after the word', () => {
    expect(hover('GOLD = 1', 'GOLD')?.end).toBe(4);
    const model = monaco.editor.createModel('GOLD = 1', 'qsp');
    expect(hoverTargetAt('GOLD = 1', qspLineTokens(model, 1, 'qsp'), 4)?.target.name).toBe('GOLD');
    model.dispose();
  });
});

describe('qspLineTokens', () => {
  it('tokenizes once per model version', () => {
    const model = monaco.editor.createModel('A = 1', 'qsp');
    const first = qspLineTokens(model, 1, 'qsp');
    expect(qspLineTokens(model, 1, 'qsp')).toBe(first);
    model.setValue('B = 2');
    const second = qspLineTokens(model, 1, 'qsp');
    expect(second).not.toBe(first);
    expect(second[0]).toMatchObject({ offset: 0, type: 'identifier.qsp' });
    model.dispose();
  });
});

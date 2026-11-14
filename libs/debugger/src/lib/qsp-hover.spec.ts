import { describe, expect, it } from 'vitest';
import { monaco } from './monaco-setup';
import { hoverPlanAt } from './qsp-hover';
import { qspLineTokens } from './qsp-tokens';

/** The hover plan for the first occurrence of `word` in the one-line program `code`. */
function planAt(code: string, word: string) {
  const model = monaco.editor.createModel(code, 'qsp');
  try {
    return hoverPlanAt(code, qspLineTokens(model, 1, 'qsp'), code.indexOf(word))?.plan;
  } finally {
    model.dispose();
  }
}

describe('hoverPlanAt', () => {
  it('reads a function or operator name that is assigned to as a variable', () => {
    const cases: Array<[string, string]> = [
      ['MID = 1', 'MID'],
      ['SET MID = 1', 'MID'],
      ["$MID = 'x'", '$MID'],
      ['LOC = 1', 'LOC'],
      ['OBJ = 1', 'OBJ'],
      ['STEP = 1', 'STEP'],
    ];
    for (const [code, word] of cases) expect(planAt(code, word), code).toEqual({ kind: 'value', name: word });
  });

  it('does not hover a function call', () => {
    expect(planAt("X = MID('a', 1)", 'MID')).toBeUndefined();
    expect(planAt("X = $MID('a', 1)", '$MID')).toBeUndefined();
  });

  it('does not read a keyword index as a variable', () => {
    expect(planAt('X = A[LOC]', 'A')).toEqual({ kind: 'summary', name: 'A' });
  });
});

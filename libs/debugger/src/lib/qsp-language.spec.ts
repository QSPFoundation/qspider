import { describe, expect, it } from 'vitest';
import { monaco } from './monaco-setup';

/** Tokens per line; the language postfix (`.qsp`) is stripped from the type. */
export function tokens(code: string, lang = 'qsp'): Array<Array<{ text: string; type: string }>> {
  const postfix = `.${lang}`;
  return monaco.editor.tokenize(code, lang).map((lineTokens, index) => {
    const line = code.split(/\r\n|\r|\n/)[index] ?? '';
    return lineTokens.map((token, i) => ({
      text: line.slice(token.offset, lineTokens[i + 1]?.offset ?? line.length),
      type: token.type.endsWith(postfix) ? token.type.slice(0, -postfix.length) : token.type,
    }));
  });
}

describe('qsp tokenizer', () => {
  it('tokenizes a plain name as identifier', () => {
    expect(tokens('GOLD = 1')[0]).toContainEqual({ text: 'GOLD', type: 'identifier' });
  });
});

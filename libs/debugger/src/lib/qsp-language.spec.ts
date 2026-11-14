import { describe, expect, it } from 'vitest';
import { monaco } from './monaco-setup';
import { isQspKeyword, QSP_CONTROL_WORDS, QSP_FUNCTIONS, QSP_OPERATOR_WORDS, QSP_STATEMENTS } from './qsp-language';

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

/** The tokens of a one-line program. */
const line = (code: string, lang = 'qsp') => tokens(code, lang)[0];

/** The type of the token whose text is `text` (the first one, or the `nth` one). */
function typeOf(lineTokens: Array<{ text: string; type: string }>, text: string, nth = 0): string | undefined {
  return lineTokens.filter((token) => token.text === text)[nth]?.type;
}

const isComment = (type: string) => type === 'comment';

describe('qsp tokenizer', () => {
  it('tokenizes a plain name as identifier', () => {
    expect(line('GOLD = 1')).toContainEqual({ text: 'GOLD', type: 'identifier' });
  });

  describe('names', () => {
    it('reads names in any script, prefixed names and whole names only', () => {
      expect(line('ПЕРЕМЕННАЯ = 5')).toContainEqual({ text: 'ПЕРЕМЕННАЯ', type: 'identifier' });
      expect(line('$ИМЯ = 5')).toContainEqual({ text: '$ИМЯ', type: 'variable' });
      expect(line('X = GOLDSMITH')).toContainEqual({ text: 'GOLDSMITH', type: 'identifier' });
    });

    it('reads the fields of a path', () => {
      expect(line('A.B.C = 1')).toEqual([
        { text: 'A', type: 'identifier' },
        { text: '.', type: 'delimiter' },
        { text: 'B', type: 'variable.field' },
        { text: '.', type: 'delimiter' },
        { text: 'C', type: 'variable.field' },
        { text: ' ', type: '' },
        { text: '=', type: 'operator' },
        { text: ' ', type: '' },
        { text: '1', type: 'number' },
      ]);
      expect(line('X = A.$NAME')).toContainEqual({ text: '$NAME', type: 'variable.field' });
      const quoted = line("X = A.'some field'");
      const dot = quoted.findIndex((token) => token.text === '.');
      expect(quoted[dot]).toEqual({ text: '.', type: 'delimiter' });
      expect(quoted[dot + 1]).toEqual({ text: "'some field'", type: 'string' });
    });

    it('reads a record field name', () => {
      const record = line("R = [NAME: 'Bob', 'FULL NAME': 1]");
      expect(record).toContainEqual({ text: 'NAME', type: 'field.record' });
      expect(record).toContainEqual({ text: "'FULL NAME'", type: 'string' });
    });

    it('reads functions, plain or prefixed, unless they are assigned to', () => {
      expect(line("$S = $MID('hello', 2)")).toContainEqual({ text: '$MID', type: 'predefined' });
      expect(line("$S = $MID('hello', 2)")).toContainEqual({ text: '$S', type: 'variable' });
      expect(line("X = MID('a', 1)")).toContainEqual({ text: 'MID', type: 'predefined' });
      expect(line('X = #MAX(1, 2)')).toContainEqual({ text: '#MAX', type: 'predefined' });
      expect(line('MID = 1')).toContainEqual({ text: 'MID', type: 'identifier' });
      expect(line('SET MID = 1')).toContainEqual({ text: 'MID', type: 'identifier' });
      expect(line('AND = 1')).toContainEqual({ text: 'AND', type: 'identifier' });
      expect(line('$IF = 1')).toContainEqual({ text: '$IF', type: 'variable' });
      expect(line('END = 1')).toContainEqual({ text: 'END', type: 'keyword' });
    });
  });

  describe('keywords', () => {
    it('reads the two-word statements as one keyword', () => {
      const code = line("ADD OBJ 'o' & DEL OBJ 'o' & DEL ACT 'x' & MOD OBJ 'o', 'p' & CLOSE ALL");
      for (const word of ['ADD OBJ', 'DEL OBJ', 'DEL ACT', 'MOD OBJ', 'CLOSE ALL']) {
        expect(code).toContainEqual({ text: word, type: 'keyword' });
      }
    });

    it('reads ELSE IF as one keyword and the statement after ELSE', () => {
      const code = line('IF A: X = 1 ELSE IF B: X = 2 ELSE X = 3');
      expect(code).toContainEqual({ text: 'ELSE IF', type: 'keyword' });
      expect(typeOf(code, 'ELSE')).toBe('keyword');
      expect(typeOf(code, 'X', 2)).toBe('identifier');
    });

    it('reads the starred statements', () => {
      expect(line("*PL 'x'")[0]).toEqual({ text: '*PL', type: 'keyword' });
    });

    it('reads the newer statements and functions', () => {
      const code = line("ALIAS Y = 'x' & INSVAR 'b', 0 & MOVEARR 'd', 'c' & K = ARRKEY('$a', 0) & EXEC 'pl 1'");
      for (const word of ['ALIAS', 'INSVAR', 'MOVEARR', 'EXEC']) expect(typeOf(code, word)).toBe('keyword');
      expect(typeOf(code, 'ARRKEY')).toBe('predefined');
    });

    it('reads every engine name as a keyword or function', () => {
      const lists = [QSP_STATEMENTS, QSP_FUNCTIONS, QSP_CONTROL_WORDS, QSP_OPERATOR_WORDS];
      const expected = (word: string) => (QSP_FUNCTIONS.includes(word) ? 'predefined' : 'keyword');
      for (const word of lists.flat()) {
        const spelled = word.toUpperCase();
        // At a statement start every entry, two-word and starred forms included, is one token.
        expect(line(`${spelled} 1`)[0], `${spelled} at statement start`).toEqual({
          text: spelled,
          type: expected(word),
        });
        // In an expression every single name is one token.
        if (/^[a-z_]+$/.test(word)) {
          expect(line(`X = ${spelled}`)[4], `${spelled} in an expression`).toEqual({
            text: spelled,
            type: expected(word),
          });
        }
      }
    });

    it('answers isQspKeyword for every list, ignoring case and function prefixes', () => {
      for (const word of ['pl', 'PL', '*PL', 'add obj', 'If', 'loop', 'and', 'Mid', '$MID', '#max', 'arrkey']) {
        expect(isQspKeyword(word), word).toBe(true);
      }
      for (const word of ['GOLD', 'goldsmith', '$IF', '$PL', 'del', '']) {
        expect(isQspKeyword(word), word).toBe(false);
      }
    });
  });

  describe('comments and !', () => {
    it('reads ! as not-equal in an expression', () => {
      expect(line('IF A ! 1: X = 1')).toContainEqual({ text: '!', type: 'operator' });
      expect(line('X = (A & ! B)')).toContainEqual({ text: '!', type: 'operator' });
      expect(line('X = (A & ! B)')).toContainEqual({ text: '&', type: 'operator' });
    });

    it('reads ! at a statement start as a comment', () => {
      expect(line('A = 1 & ! NOTE')).toContainEqual({ text: '! NOTE', type: 'comment' });
      expect(line('IF A: ! NOTE')).toContainEqual({ text: '! NOTE', type: 'comment' });
      expect(line("! A COMMENT WITH 'quote' AND {brace}").every((token) => isComment(token.type))).toBe(true);
    });

    it('reads a comment whose string and block span lines, then code again', () => {
      const code = tokens("! NOTE 'spans\r\nlines' {and\r\na block} END\r\nB = 2");
      for (const lineTokens of code.slice(0, 3)) {
        expect(lineTokens.every((token) => isComment(token.type))).toBe(true);
      }
      expect(code[3]).toContainEqual({ text: 'B', type: 'identifier' });
    });

    it('ends a comment at the end of its line', () => {
      const code = tokens('! NOTE\r\nMID = 1');
      expect(code[1]).toContainEqual({ text: 'MID', type: 'identifier' });
    });
  });

  describe('strings', () => {
    it('has no backslash escape', () => {
      const code = line("$U = 'C:\\' & X = 1");
      expect(code).toContainEqual({ text: "'C:\\'", type: 'string' });
      expect(code).toContainEqual({ text: 'X', type: 'identifier' });
    });

    it('escapes a doubled quote', () => {
      const code = line("X = 'say ''hi'''");
      expect(code).toContainEqual({ text: "''", type: 'string.escape' });
      expect(code[code.length - 1]).toEqual({ text: "'", type: 'string' });
      expect(line('X = "say ""hi"""')).toContainEqual({ text: '""', type: 'string.escape' });
    });

    it('spans lines', () => {
      const code = tokens("X = 'multi\r\nline' & Y = 1");
      expect(code[1][0]).toEqual({ text: "line'", type: 'string' });
      expect(code[1]).toContainEqual({ text: 'Y', type: 'identifier' });
    });

    it('reads <<…>> inside a string as code', () => {
      const code = line("X = 'to <<$P.NAME>> and <<A>>'");
      expect(code).toContainEqual({ text: '<<', type: 'delimiter.interpolation' });
      expect(code).toContainEqual({ text: '>>', type: 'delimiter.interpolation' });
      expect(code).toContainEqual({ text: '$P', type: 'variable' });
      expect(code).toContainEqual({ text: 'NAME', type: 'variable.field' });
      expect(code).toContainEqual({ text: 'A', type: 'identifier' });
      expect(code[code.length - 1]).toEqual({ text: "'", type: 'string' });
    });

    it('ends a string at its quote even inside an unclosed <<', () => {
      const code = line("$S = 'a << b' & X = 1");
      expect(code).toContainEqual({ text: "'", type: 'string' });
      expect(code).toContainEqual({ text: 'X', type: 'identifier' });
      expect(typeOf(code, '&')).toBe('operator');
    });
  });

  describe('blocks', () => {
    it('reads the code of a block', () => {
      const code = line("CODE = { pl 'in <<x>>' & k = 1 }");
      expect(code).toContainEqual({ text: 'pl', type: 'keyword' });
      expect(code).toContainEqual({ text: 'x', type: 'identifier' });
      expect(code).toContainEqual({ text: 'k', type: 'identifier' });
    });

    it('reads statement starts across the lines of a block', () => {
      const code = tokens('CODE = {\r\n! note\r\n}\r\nX = 1\r\nY = { a = 1 } & Z = 2');
      expect(code[1].every((token) => isComment(token.type))).toBe(true);
      expect(code[2]).toEqual([{ text: '}', type: 'delimiter.bracket' }]);
      expect(code[3]).toContainEqual({ text: 'X', type: 'identifier' });
      expect(code[4]).toContainEqual({ text: 'Z', type: 'identifier' });
    });
  });

  describe('other tokens', () => {
    it('reads the rest of the language', () => {
      expect(line('U = ?')).toContainEqual({ text: '?', type: 'constant' });
      expect(line('N += 2')).toContainEqual({ text: '+=', type: 'operator' });
      expect(line('Z = 1 =< 2')).toContainEqual({ text: '=<', type: 'operator' });
      expect(line(':LABEL1')).toEqual([
        { text: ':', type: 'delimiter' },
        { text: 'LABEL1', type: 'label' },
      ]);
      const calls = line("GOSUB 'second' & @SECOND(1) & @@SECOND");
      expect(calls).toContainEqual({ text: '@SECOND', type: 'function.call' });
      expect(calls).toContainEqual({ text: '@@SECOND', type: 'function.call' });
      expect(line('X = 1.5').slice(-3)).toEqual([
        { text: '1', type: 'number' },
        { text: '.', type: 'delimiter' },
        { text: '5', type: 'number' },
      ]);
    });
  });

  describe('line starts', () => {
    it('reads a line that starts with something other than a name', () => {
      const code = tokens(
        "X = 1\r\n'hello' ! 'b' & ! NOTE\r\n{ A = 1 }\r\n(1)\r\n5\r\n@LOC\r\n}\r\n? & * 2\r\nMID = 1",
      );
      expect(code[1][0]).toEqual({ text: "'hello'", type: 'string' });
      expect(typeOf(code[1], '!')).toBe('operator');
      expect(code[1]).toContainEqual({ text: '! NOTE', type: 'comment' });
      expect(code[2]).toContainEqual({ text: 'A', type: 'identifier' });
      expect(code[3][0]).toEqual({ text: '(', type: 'delimiter.bracket' });
      expect(code[4]).toEqual([{ text: '5', type: 'number' }]);
      expect(code[5]).toEqual([{ text: '@LOC', type: 'function.call' }]);
      expect(code[6]).toEqual([{ text: '}', type: 'delimiter.bracket' }]);
      expect(code[7][0]).toEqual({ text: '?', type: 'constant' });
      expect(code[8]).toContainEqual({ text: 'MID', type: 'identifier' });
    });

    it('starts each line of an unclosed bracket afresh', () => {
      expect(tokens('X = (A\r\nMID = 1')[1]).toContainEqual({ text: 'MID', type: 'identifier' });
      expect(tokens('X = 1\r\n  :LBL')[1]).toContainEqual({ text: 'LBL', type: 'label' });
    });
  });

  describe('statement starts', () => {
    it('reads prefixed names at a statement start', () => {
      expect(line('$X')).toEqual([{ text: '$X', type: 'variable' }]);
      expect(line('#MAX(1, 2)')[0]).toEqual({ text: '#MAX', type: 'predefined' });
      expect(line("$MID('a', 1)")[0]).toEqual({ text: '$MID', type: 'predefined' });
      expect(line("$S + 'a'")[0]).toEqual({ text: '$S', type: 'variable' });
      expect(line('LOCAL $X')).toContainEqual({ text: '$X', type: 'variable' });
      const set = line('SET $X, $Y = 1, 2');
      expect(set).toContainEqual({ text: '$X', type: 'variable' });
      expect(set).toContainEqual({ text: '$Y', type: 'variable' });
    });

    it('reads a label at any statement start', () => {
      expect(line('X = 1 & :LBL')).toContainEqual({ text: 'LBL', type: 'label' });
    });
  });

  describe('qsp-expr', () => {
    it('starts in an expression and leaves >> to the embedding language', () => {
      const code = line("MID($A, 1) + 'x' >>", 'qsp-expr');
      expect(code).toContainEqual({ text: 'MID', type: 'predefined' });
      expect(code).toContainEqual({ text: '$A', type: 'variable' });
      expect(code[code.length - 1]).toEqual({ text: '>>', type: 'delimiter.interpolation' });
      expect(line('A ! 1', 'qsp-expr')).toContainEqual({ text: '!', type: 'operator' });
    });
  });
});

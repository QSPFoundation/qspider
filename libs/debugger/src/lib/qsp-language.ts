import type { languages } from 'monaco-editor';

// The names the engine knows (upstream statement, function and operator tables), lower case.

export const QSP_STATEMENTS: readonly string[] = [
  'act',
  'add obj',
  'addobj',
  'alias',
  'cla',
  '*clear',
  'clear',
  'close',
  'close all',
  '*clr',
  'clr',
  'cls',
  'cmdclear',
  'cmdclr',
  'copyarr',
  'del act',
  'delact',
  'del obj',
  'delobj',
  'dynamic',
  'exec',
  'exit',
  'freelib',
  'gosub',
  'goto',
  'gs',
  'gt',
  'inclib',
  'insvar',
  'jump',
  'killall',
  'killobj',
  'killvar',
  'menu',
  'mod obj',
  'modobj',
  'movearr',
  'msg',
  '*nl',
  'nl',
  'opengame',
  'openqst',
  '*p',
  'p',
  '*pl',
  'pl',
  'play',
  'refint',
  'resetobj',
  'savegame',
  'scanstr',
  'setvar',
  'settimer',
  'showacts',
  'showinput',
  'showobjs',
  'showstat',
  'sortarr',
  'unpackarr',
  'unsel',
  'unselect',
  'view',
  'wait',
  'xgoto',
  'xgt',
];

export const QSP_FUNCTIONS: readonly string[] = [
  'arrcomp',
  'arritem',
  'arrkey',
  'arrpack',
  'arrpos',
  'arrsize',
  'arrtype',
  'countobj',
  'curacts',
  'curloc',
  'curobjs',
  'desc',
  'dyneval',
  'func',
  'getobj',
  'iif',
  'input',
  'instr',
  'isnum',
  'isplay',
  'lcase',
  'len',
  'maintxt',
  'max',
  'mid',
  'min',
  'msecscount',
  'qspver',
  'rand',
  'replace',
  'rgb',
  'rnd',
  'selact',
  'selobj',
  'stattxt',
  'str',
  'strcomp',
  'strfind',
  'strpos',
  'trim',
  'ucase',
  'user_text',
  'usrtxt',
  'val',
];

export const QSP_CONTROL_WORDS: readonly string[] = [
  'if',
  'elseif',
  'else',
  'end',
  'loop',
  'while',
  'step',
  'set',
  'let',
  'local',
];

export const QSP_OPERATOR_WORDS: readonly string[] = ['and', 'or', 'mod', 'no', 'obj', 'loc'];

const KEYWORDS = new Set([...QSP_STATEMENTS, ...QSP_CONTROL_WORDS, ...QSP_OPERATOR_WORDS]);
const FUNCTIONS = new Set(QSP_FUNCTIONS);

/** Whether `word` is an engine name: a statement, control word or operator word, or a function (prefix or not). */
export function isQspKeyword(word: string): boolean {
  const lower = word.toLowerCase();
  return KEYWORDS.has(lower) || FUNCTIONS.has(lower.replace(/^[$#%]/, ''));
}

// The words that open a statement even when an assignment follows (`END = 1` is not a variable, `MID = 1` is).
// `while` and `step` only mean something inside a `loop` header.
const STATEMENT_WORDS = [...QSP_STATEMENTS, ...QSP_CONTROL_WORDS.filter((word) => word !== 'while' && word !== 'step')];

type Rule = languages.IMonarchLanguageRule;

/** A name: a run of non-delimiters, not `.`, not starting with a digit (a `$`/`#`/`%` prefix is part of it). */
const NAME = '(?!\\d)@nameChar+';
// An assignment follows: `=`, `+=`, `-=`, `*=`, `/=` (not the comparisons `=<`, `=>`), or an index.
const ASSIGNED = '(?=\\s*(?:[-+*/]?=(?![<>=])|\\[))';
const WORD_END = '(?!@nameChar)';
const STARRED = `\\*(?:pl|p|nl|clear|clr)${WORD_END}`;
/**
 * A new line that the statement start reads differently from an expression: it starts with a name, `!`, `&`, `:`
 * or a starred statement. The statement start consumes all of these, so switching to it here never loops back.
 */
const LINE_STARTS_STATEMENT = `^(?=\\s*(?:[!&:]|${STARRED}|(?!\\d)@nameChar))`;

/** The rules every expression shares, wherever it is: in a statement, a bracket, a block or a `<<…>>`. */
const expressionRules: Rule[] = [
  [/@@@@?(?:@nameChar|\.)+/, 'function.call'],
  [/(\.)((?!\d)@nameChar+)/, ['delimiter', 'variable.field']],
  [/([$#%])((?!\d)@nameChar+)/, { cases: { '$2@functions': 'predefined', '@default': 'variable' } }],
  [new RegExp(NAME), { cases: { '@functions': 'predefined', '@keywords': 'keyword', '@default': 'identifier' } }],
  [/\d+/, 'number'],
  [/\?/, 'constant'],
  [/'/, { token: 'string', next: '@singleString' }],
  [/"/, { token: 'string', next: '@doubleString' }],
  [/\{/, { token: 'delimiter.bracket', next: '@blockStart' }],
  [/[([]/, { token: 'delimiter.bracket', next: '@bracket' }],
  [/[)\]}]/, 'delimiter.bracket'],
  [/[-+*/]=|<>|<=|=<|>=|=>|[=<>+\-*/!&]/, 'operator'],
  [/[,.:]/, 'delimiter'],
];

/**
 * A statement start and the expression after it, for one nesting level (the top or a `{…}` block). `&` and `:`
 * outside brackets, `ELSE` and a new line return to the statement start.
 */
function statementStates(start: string, expression: string, inBlock: boolean): Record<string, Rule[]> {
  const closeBlock: Rule[] = inBlock ? [[/\}/, { token: 'delimiter.bracket', next: '@pop' }]] : [];
  const toStart = { switchTo: `@${start}` };
  const toExpression = { switchTo: `@${expression}` };
  return {
    [start]: [
      [/\s+/, ''],
      [/(:)(\s*)([^&]*[^&\s])/, ['delimiter', '', 'label']],
      [/!/, { token: 'comment', next: '@comment' }],
      [/&/, 'operator'],
      [/:/, 'delimiter'],
      ...closeBlock,
      [
        new RegExp(`(?:(?:add|del|mod)\\s+obj|del\\s+act|close\\s+all|else\\s+if)${WORD_END}`),
        {
          token: 'keyword',
          ...toExpression,
        },
      ],
      [new RegExp(STARRED), { token: 'keyword', ...toExpression }],
      [new RegExp(`(?:else|set|let|local)${WORD_END}`), 'keyword'],
      [new RegExp(`[$#%]${NAME}${ASSIGNED}`), { token: 'variable', ...toExpression }],
      [
        new RegExp(`${NAME}${ASSIGNED}`),
        {
          cases: {
            '@statementWords': { token: 'keyword', ...toExpression },
            '@default': { token: 'identifier', ...toExpression },
          },
        },
      ],
      [
        /([$#%])((?!\d)@nameChar+)/,
        {
          cases: {
            '$2@functions': { token: 'predefined', ...toExpression },
            '@default': { token: 'variable', ...toExpression },
          },
        },
      ],
      [
        new RegExp(NAME),
        {
          cases: {
            '@statementWords': { token: 'keyword', ...toExpression },
            '@functions': { token: 'predefined', ...toExpression },
            '@keywords': { token: 'keyword', ...toExpression },
            '@default': { token: 'identifier', ...toExpression },
          },
        },
      ],
      // Whatever the rules above leave is read as an expression; LINE_STARTS_STATEMENT must never match it.
      [/./, { token: '@rematch', ...toExpression }],
    ],
    [expression]: [
      [new RegExp(LINE_STARTS_STATEMENT), { token: '', ...toStart }],
      [/\s+/, ''],
      [/&/, { token: 'operator', ...toStart }],
      [/:/, { token: 'delimiter', ...toStart }],
      ...closeBlock,
      [new RegExp(`else\\s+if${WORD_END}`), 'keyword'],
      [new RegExp(`else${WORD_END}`), { token: 'keyword', ...toStart }],
      ...expressionRules,
    ],
  };
}

/** `'…'` or `"…"`: a doubled quote is the escape, `<<…>>` holds code, and the string may span lines. */
function stringState(quote: string, interpolation: string): Rule[] {
  return [
    [new RegExp(`[^${quote}<]+`), 'string'],
    [/<</, { token: 'delimiter.interpolation', next: `@${interpolation}` }],
    [/</, 'string'],
    [new RegExp(quote + quote), 'string.escape'],
    [new RegExp(quote), { token: 'string', next: '@pop' }],
  ];
}

/** `<<…>>` inside a string: an expression up to `>>`; the outer string's quote ends the string anyway. */
function interpolationState(quote: string): Rule[] {
  return [
    [/>>/, { token: 'delimiter.interpolation', next: '@pop' }],
    [new RegExp(quote), { token: '@rematch', next: '@pop' }],
    [/\s+/, ''],
    ...expressionRules,
  ];
}

/** The states every QSP tokenizer shares, besides its own root. */
const sharedStates: Record<string, Rule[]> = {
  ...statementStates('blockStart', 'blockExpression', true),
  // `(…)` and `[…]`: `&` and `!` are operators, `NAME:` names a record field; they end with the line.
  bracket: [
    [/^/, { token: '', next: '@pop' }],
    [/\s+/, ''],
    [/[)\]]/, { token: 'delimiter.bracket', next: '@pop' }],
    [new RegExp(`${NAME}(?=\\s*:)`), 'field.record'],
    ...expressionRules,
  ],
  singleString: stringState("'", 'singleInterpolation'),
  doubleString: stringState('"', 'doubleInterpolation'),
  singleInterpolation: interpolationState("'"),
  doubleInterpolation: interpolationState('"'),
  // `!` to the end of the line; its quoted strings and `{…}` blocks span lines, and the comment goes on after them.
  comment: [
    [/^/, { token: '', next: '@pop' }],
    [/[^'"{]+/, 'comment'],
    [/'/, { token: 'comment', next: '@commentSingleString' }],
    [/"/, { token: 'comment', next: '@commentDoubleString' }],
    [/\{/, { token: 'comment', next: '@commentBlock' }],
  ],
  commentSingleString: [
    [/[^']+/, 'comment'],
    [/'/, { token: 'comment', next: '@pop' }],
  ],
  commentDoubleString: [
    [/[^"]+/, 'comment'],
    [/"/, { token: 'comment', next: '@pop' }],
  ],
  commentBlock: [
    [/[^'"{}]+/, 'comment'],
    [/'/, { token: 'comment', next: '@commentSingleString' }],
    [/"/, { token: 'comment', next: '@commentDoubleString' }],
    [/\{/, { token: 'comment', next: '@commentBlock' }],
    [/\}/, { token: 'comment', next: '@pop' }],
  ],
};

const lists = {
  // The engine's code is upper-cased outside strings and blocks, verbatim inside blocks.
  ignoreCase: true,
  defaultToken: '',
  nameChar: /[^\s&'"()[\]{}=!<>+\-/*\\,:;^@?.]/,
  functions: [...QSP_FUNCTIONS],
  keywords: [...QSP_STATEMENTS, ...QSP_CONTROL_WORDS, ...QSP_OPERATOR_WORDS],
  statementWords: STATEMENT_WORDS,
};

/** QSP code: lines of statements. */
export const qspLanguageDefinition: languages.IMonarchLanguage = {
  ...lists,
  tokenizer: {
    ...statementStates('root', 'expression', false),
    ...sharedStates,
  },
};

/**
 * One QSP expression, for `<<…>>` embedded in another language. `>>` is left as a token of its own, without a state
 * change, for the embedding language to end the expression on.
 */
export const qspExpressionDefinition: languages.IMonarchLanguage = {
  ...lists,
  tokenizer: {
    root: [[/>>/, 'delimiter.interpolation'], [/\s+/, ''], ...expressionRules],
    ...sharedStates,
  },
};

export const qspLanguageConfiguration: languages.LanguageConfiguration = {
  comments: {
    lineComment: '!',
  },

  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],

  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] },
  ],

  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

/** Registers `qsp` (code) and `qsp-expr` (one expression, for embedding) with Monaco. */
export function registerQspLanguage(monaco: typeof import('monaco-editor')) {
  monaco.languages.register({
    id: 'qsp',
    extensions: ['.qsp', '.qsps'],
    aliases: ['QSP', 'qsp'],
    mimetypes: ['text/qsp'],
  });
  monaco.languages.setLanguageConfiguration('qsp', qspLanguageConfiguration);
  monaco.languages.setMonarchTokensProvider('qsp', qspLanguageDefinition);

  monaco.languages.register({ id: 'qsp-expr' });
  monaco.languages.setMonarchTokensProvider('qsp-expr', qspExpressionDefinition);
}

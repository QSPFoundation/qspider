import type { languages } from 'monaco-editor';

export const qspLanguageDefinition: languages.IMonarchLanguage = {
  // Set default token
  defaultToken: '',

  // QSP is case-insensitive
  ignoreCase: true,

  // Define keywords (lowercase only - case handling done in tokenizer)
  keywords: [
    'set',
    'let',
    'local',
    'act',
    'end',
    'if',
    'else',
    'elseif',
    'loop',
    'while',
    'step',
    'and',
    'or',
    'mod',
    'no',
    'obj',
    'loc',
    'exit',
    'jump',
    'gosub',
    'gs',
    'goto',
    'gt',
    'xgoto',
    'xgt',
    'pl',
    'p',
    'nl',
    'clear',
    'clr',
    '*pl',
    '*p',
    '*nl',
    '*clear',
    '*clr',
    'msg',
    'wait',
    'addobj',
    'delobj',
    'modobj',
    'resetobj',
    'killobj',
    'unselect',
    'unsel',
    'killall',
    'cla',
    'delact',
    'cls',
    'cmdclear',
    'cmdclr',
    'menu',
    'settimer',
    'dynamic',
    'setvar',
    'killvar',
    'copyarr',
    'sortarr',
    'scanstr',
    'unpackarr',
    'opengame',
    'savegame',
    'openqst',
    'inclib',
    'freelib',
    'refint',
    'showacts',
    'showinput',
    'showobjs',
    'showstat',
    'play',
    'close',
    'view',
    'desc',
    'mod',
    'max',
    'min',
    'rand',
    'rnd',
    'val',
    'iif',
    'dyneval',
    'func',
    'input',
    'usrtxt',
    'user_text',
    'maintxt',
    'stattxt',
    'getobj',
    'countobj',
    'selobj',
    'curloc',
    'curobjs',
    'selact',
    'curacts',
    'arrsize',
    'arrtype',
    'arritem',
    'arrpack',
    'arrpos',
    'arrcomp',
    'instr',
    'isnum',
    'trim',
    'ucase',
    'lcase',
    'len',
    'mid',
    'replace',
    'str',
    'strcomp',
    'strfind',
    'strpos',
    'isplay',
    'rgb',
    'msecscount',
    'qspver',
  ],

  // Define operators
  operators: ['=', '<>', '<=', '>=', '<', '>', '+', '-', '*', '/', '&'],

  // Define symbols
  symbols: /[=><!~?:&|+\-*/%^]+/,

  // Define escape sequences
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // Define the tokenizer
  tokenizer: {
    root: [
      // Function calls with @ and @@ (must come before identifiers)
      [/@@[a-zA-Z_]\w*/i, 'function.call'],
      [/@[a-zA-Z_]\w*/i, 'function.call'],

      // Identifiers with type prefixes
      [/[$#%][a-zA-Z_]\w*/, 'variable'],

      // Keywords and identifiers (keywords checked first via cases)
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],

      // Comments (if QSP supports them, might need adjustment)
      [/!.*$/, 'comment'],

      // Whitespace
      { include: '@whitespace' },

      // Delimiters and operators
      [/[{}()[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [
        /@symbols/,
        {
          cases: {
            '@operators': 'operator',
            '@default': '',
          },
        },
      ],

      // Numbers
      [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // String interpolation with << >>
      [/<</, { token: 'string.interpolation', next: '@interpolation' }],

      // Strings
      [/'/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      [/"/, { token: 'string.quote', bracket: '@open', next: '@dblstring' }],
    ],

    // Handle string interpolation << >>
    interpolation: [
      [/>>/, { token: 'string.interpolation', next: '@pop' }],
      [/[^>]+/, 'string.interpolation.content'],
    ],

    // Handle single quoted strings
    string: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    // Handle double quoted strings
    dblstring: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    // Handle whitespace
    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],

    // Handle block comments
    comment: [
      [/[^/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      [/\*\//, 'comment', '@pop'],
      [/[/*]/, 'comment'],
    ],
  },
};

export const qspLanguageConfiguration: languages.LanguageConfiguration = {
  comments: {
    lineComment: '!',
    blockComment: ['/*', '*/'],
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

  folding: {
    markers: {
      start: new RegExp('^\\s*#region\\b'),
      end: new RegExp('^\\s*#endregion\\b'),
    },
  },
};

// Function to register QSP language with Monaco
export function registerQspLanguage(monaco: typeof import('monaco-editor')) {
  // Register the language
  monaco.languages.register({
    id: 'qsp',
    extensions: ['.qsp', '.qsps'],
    aliases: ['QSP', 'qsp'],
    mimetypes: ['text/qsp'],
  });

  // Set the language configuration
  monaco.languages.setLanguageConfiguration('qsp', qspLanguageConfiguration);

  // Set the monarch tokenizer
  monaco.languages.setMonarchTokensProvider('qsp', qspLanguageDefinition);
}

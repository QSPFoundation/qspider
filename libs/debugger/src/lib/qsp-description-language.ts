// @ts-expect-error Monaco's basic languages ship no typings; `conf` and `language` are typed below.
import { conf, language } from 'monaco-editor/esm/vs/basic-languages/html/html.js';
import type * as Monaco from 'monaco-editor';

type Rule = Monaco.languages.IMonarchLanguageRule;

const htmlConfiguration = conf as Monaco.languages.LanguageConfiguration;
const htmlLanguage = language as Monaco.languages.IMonarchLanguage;

/** `<<` enters a QSP expression; the `@interpolation` state ends it on `>>`. */
const interpolationStart: Rule = [
  /<</,
  { token: 'delimiter.interpolation', next: '@interpolation', nextEmbedded: 'qsp-expr' },
];

/** A quoted attribute value, split so that `<<…>>` inside it is code. */
function attributeValueState(quote: string): Rule[] {
  return [
    [new RegExp(quote), { token: 'attribute.value', next: '@pop' }],
    interpolationStart,
    [new RegExp(`[^${quote}<]+`), 'attribute.value'],
    [/</, 'attribute.value'],
  ];
}

const isAttributeValueRule = (rule: Rule, quote: string) =>
  Array.isArray(rule) &&
  rule[0] instanceof RegExp &&
  rule[0].source === `${quote}([^${quote}]*)${quote}` &&
  rule[1] === 'attribute.value';

/**
 * HTML with `<<…>>` as QSP expressions, as the engine reads a location's description: in text and in quoted
 * attribute values.
 */
export function qspDescriptionDefinition(): Monaco.languages.IMonarchLanguage {
  const html = structuredClone(htmlLanguage);
  const tokenizer: Record<string, Rule[]> = {};
  for (const [state, rules] of Object.entries(html.tokenizer)) {
    tokenizer[state] = rules.map((rule) => {
      if (isAttributeValueRule(rule, '"')) return [/"/, { token: 'attribute.value', next: '@doubleValue' }];
      if (isAttributeValueRule(rule, "'")) return [/'/, { token: 'attribute.value', next: '@singleValue' }];
      return rule;
    });
  }
  // Text: `<<` before the rule that takes a lone `<` as a delimiter.
  const lone = tokenizer.root.findIndex((rule) => Array.isArray(rule) && String(rule[0]) === '/</');
  tokenizer.root.splice(lone, 0, interpolationStart);
  tokenizer.doubleValue = attributeValueState('"');
  tokenizer.singleValue = attributeValueState("'");
  // The embedded `qsp-expr` gets the text up to `>>`, which then leaves both the state and the expression.
  tokenizer.interpolation = [[/>>/, { token: 'delimiter.interpolation', next: '@pop', nextEmbedded: '@pop' }]];
  return { ...html, tokenizer };
}

/** Registers `qsp-description`: a location's description, HTML with `<<…>>` expressions. */
export function registerQspDescriptionLanguage(monaco: typeof Monaco): void {
  monaco.languages.register({ id: 'qsp-description' });
  monaco.languages.setLanguageConfiguration('qsp-description', htmlConfiguration);
  monaco.languages.setMonarchTokensProvider('qsp-description', qspDescriptionDefinition());
}

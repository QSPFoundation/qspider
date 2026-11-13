import type { QspVariableValue } from '@qsp/wasm-engine';
import { scalarOrUnset } from '@qspider/game-state';

/**
 * Builds a QSP double-quoted string literal that evaluates to `value` verbatim.
 * - A quote inside a literal is written doubled (`""`), the rule `@qsp/converters` readQsps applies.
 * - QSP expands `<<expr>>` inside literals, so every `<` that precedes another `<` is cut off with
 *   `" + "`: the pieces concatenate back to the text without `<<` ever being adjacent in the source.
 * - Line breaks (textarea input) are joined with `chr(10)`; the join text is added last so it is not re-escaped.
 */
export function toQspString(value: string): string {
  const escaped = value.replace(/"/g, '""').replace(/<(?=<)/g, '<" + "');
  return `"${escaped.split(/\r\n|\r|\n/).join('" + chr(10) + "')}"`;
}

export function boundInputValue(input: { type: string; checked: boolean; value: string }): string {
  return input.type === 'checkbox' ? (input.checked ? input.value : '') : input.value;
}

/** The leading integer of the text (optional `-`, then digits, after leading whitespace), or `0` if there is none. */
function leadingInteger(value: string): string {
  return /^\s*(-?\d+)/.exec(value)?.[1] ?? '0';
}

/**
 * `$`-prefixed names always take text; unprefixed names take text only when they currently hold a string,
 * otherwise the leading integer (an unset variable or a tuple counts as numeric).
 */
export function bindAssignment(
  bind: string,
  bindKey: string,
  bindIndex: number,
  value: string,
  stored: QspVariableValue,
): string {
  let fullName = bind;
  if (bindKey) {
    fullName += `[${toQspString(bindKey)}]`;
  } else if (bindIndex) {
    fullName += `[${bindIndex}]`;
  }
  const isText = bind.startsWith('$') || typeof scalarOrUnset(stored) === 'string';
  return `${fullName} = ${isText ? toQspString(value) : leadingInteger(value)}`;
}

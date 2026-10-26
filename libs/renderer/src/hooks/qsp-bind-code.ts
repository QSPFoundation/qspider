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

export function bindAssignment(bind: string, bindKey: string, bindIndex: number, value: string): string {
  const name: string[] = [bind];
  if (bindKey || bindIndex) {
    name.push('[');
    if (bindKey) {
      name.push(`"${bindKey}"`);
    } else {
      name.push(String(bindIndex));
    }
    name.push(']');
  }
  const fullName = name.join('');
  const toSet = fullName.startsWith('$') ? toQspString(value) : value || 0;
  return `${fullName} = ${toSet}`;
}

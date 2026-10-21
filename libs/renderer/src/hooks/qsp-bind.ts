import { qspApi$, useQspVariable } from '@qspider/game-state';
import { ChangeEvent, ChangeEventHandler } from 'react';

/**
 * Builds a QSP double-quoted string literal. Inside such a literal a quote is written doubled (`""`),
 * the same rule `@qsp/converters` readQsps applies when scanning strings. Line breaks (textarea input)
 * are joined with `chr(10)` so the generated statement stays on one line.
 */
export function toQspString(value: string): string {
  return `"${value
    .replace(/"/g, '""')
    .split(/\r\n|\r|\n/)
    .join('" + chr(10) + "')}"`;
}

export function useQspBind(bind: string, bindKey: string, bindIndex: number): [string, ChangeEventHandler] {
  const value = useQspVariable(bind, bindKey, bindIndex, '');
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const type = event.target.type;
    const newValue = type === 'checkbox' ? (event.target.checked ? event.target.value : '') : event.target.value;
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
    const toSet = fullName.startsWith('$') ? toQspString(newValue) : newValue || 0;
    qspApi$.value?.execCode(`${fullName} = ${toSet}`);
  };

  return [value, handleChange];
}

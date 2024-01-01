import { qspApi$, useQspVariable } from '@qspider/game-state';
import { ChangeEvent, ChangeEventHandler } from 'react';

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
    const toSet = fullName.startsWith('$') ? `"${newValue}"` : newValue || 0;
    qspApi$.value?.execCode(`${fullName} = ${toSet}`);
  };

  return [value, handleChange];
}

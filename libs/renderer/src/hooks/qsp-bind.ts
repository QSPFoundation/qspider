import { qspApi$, useQspVariable, useQspVariableRaw } from '@qspider/game-state';
import { ChangeEvent, ChangeEventHandler } from 'react';
import { bindAssignment, boundInputValue } from './qsp-bind-code';

export function useQspBind(bind: string, bindKey: string | undefined, bindIndex: number): [string, ChangeEventHandler] {
  // A missing `qsp-bind-key` attribute arrives as undefined; the variable layer keys cells by a string key.
  const key = bindKey ?? '';
  const value = useQspVariable(bind, key, bindIndex, '');
  const stored = useQspVariableRaw(bind, key, bindIndex);
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    qspApi$.value?.execCode(bindAssignment(bind, key, bindIndex, boundInputValue(event.target), stored));
  };

  return [value, handleChange];
}

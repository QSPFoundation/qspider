import { qspApi$, useQspVariable } from '@qspider/game-state';
import { ChangeEvent, ChangeEventHandler } from 'react';
import { bindAssignment, boundInputValue } from './qsp-bind-code';

export function useQspBind(bind: string, bindKey: string, bindIndex: number): [string, ChangeEventHandler] {
  const value = useQspVariable(bind, bindKey, bindIndex, '');
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    qspApi$.value?.execCode(bindAssignment(bind, bindKey, bindIndex, boundInputValue(event.target)));
  };

  return [value, handleChange];
}

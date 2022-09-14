import { QspVaribleType } from '@qsp/wasm-engine';
import { useGameManager } from '@qspider/providers';
import { useEffect, useState } from 'react';

export function useQspVariable<Name extends string, T = QspVaribleType<Name>>(name: Name, defaultValue: T): T {
  const [value, setValue] = useState(defaultValue);
  const manager = useGameManager();
  useEffect(() => {
    const unsubscribe = manager.api.watchVariable(name, 0, (value) => setValue(value as unknown as T));
    return () => unsubscribe();
  }, [name, manager.api]);

  return value;
}

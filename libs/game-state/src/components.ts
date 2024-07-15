import { ProvidedComponents } from '@qspider/contracts';
import React from 'react';
import { atom } from 'xoid';

export const componentsRegistry$ = atom(new Map<ProvidedComponents, React.FC>(), (atom) => ({
  register(type: ProvidedComponents, component: React.FC): void {
    atom.value.set(type, component);
  },
}));

export const useComponent = (type: ProvidedComponents): React.FC => {
  const Component = componentsRegistry$.value.get(type);

  return Component || ((() => null) as React.FC);
};

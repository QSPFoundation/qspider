import { ProvidedComponents } from '@qspider/contracts';
import React from 'react';

const componentsContext = React.createContext<Record<ProvidedComponents, React.FC> | null>(null);

export const ComponentsProvider = componentsContext.Provider;

export const useComponents = (): Record<ProvidedComponents, React.FC> => {
  const components = React.useContext(componentsContext);
  if (!components) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useResources must be used within a ResourceProvider.');
  }
  return components;
};

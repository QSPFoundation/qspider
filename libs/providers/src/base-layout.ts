import { IBaseLayout } from '@qspider/contracts';
import React from 'react';

const baseLayoutContext = React.createContext<IBaseLayout | null>(null);

export const BaseLayoutProvider = baseLayoutContext.Provider;

export const useBaseLayout = (): IBaseLayout => {
  const layout = React.useContext(baseLayoutContext);
  if (!layout) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useLayout must be used within a StoreProvider.');
  }
  return layout;
};

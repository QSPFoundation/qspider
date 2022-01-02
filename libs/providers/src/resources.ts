import React from 'react';
import { IResourceManager } from '@qspider/contracts';

const resourceContext = React.createContext<IResourceManager | null>(null);

export const ResourceProvider = resourceContext.Provider;

export const useResources = (): IResourceManager => {
  const resources = React.useContext(resourceContext);
  if (!resources) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useResources must be used within a ResourceProvider.');
  }
  return resources;
};

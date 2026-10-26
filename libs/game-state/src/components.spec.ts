import { ProvidedComponents } from '@qspider/contracts';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { componentsRegistry$, useComponent } from './components';

describe('components registry', () => {
  it('useComponent falls back to a component that renders nothing when none is registered', () => {
    const Fallback = useComponent(ProvidedComponents.OpenGameButton);
    expect(Fallback({})).toBeNull();
  });

  it('useComponent returns the registered component', () => {
    const OpenGame: React.FC = () => null;
    componentsRegistry$.actions.register(ProvidedComponents.OpenGameButton, OpenGame);
    expect(useComponent(ProvidedComponents.OpenGameButton)).toBe(OpenGame);
  });
});

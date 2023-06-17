import * as RadixTooltip from '@radix-ui/react-tooltip';
import React from 'react';

export const Tooltip: React.FC<{ children: React.ReactNode; content: string }> = ({ children, content }) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal container={document.getElementById('portal-container')}>
          <RadixTooltip.Content className="q-tooltip" sideOffset={5}>
            {content}
            <RadixTooltip.Arrow className="q-tooltip-arrow" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

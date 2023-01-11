import * as Tooltip from '@radix-ui/react-tooltip';
import React from 'react';

export const QspiderTooltip: React.FC<{ children: React.ReactNode; content: string }> = ({ children, content }) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="q-tooltip" sideOffset={5}>
            {content}
            <Tooltip.Arrow className="q-tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

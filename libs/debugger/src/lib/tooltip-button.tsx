import * as RadixTooltip from '@radix-ui/react-tooltip';
import { MouseEventHandler } from 'react';

interface TooltipButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TooltipButton: React.FC<TooltipButtonProps> = ({
  onClick,
  tooltip,
  children,
  className = '',
  disabled = false,
}) => {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        <button type="button" onClick={onClick} className={className} disabled={disabled}>
          {children}
        </button>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className="q-tooltip" sideOffset={5}>
          {tooltip}
          <RadixTooltip.Arrow className="q-tooltip-arrow" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};

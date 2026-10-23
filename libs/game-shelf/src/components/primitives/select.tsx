import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import * as RadixSelect from '@radix-ui/react-select';

export interface SelectOption {
  label: string;
  value: string;
}

const SelectItem: React.FC<{ children: React.ReactNode; value: string; qa?: string }> = ({
  children,
  qa,
  ...props
}) => {
  return (
    <RadixSelect.Item className="q-select-item" data-qa={qa} data-value={qa ? props.value : undefined} {...props}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="q-select-item-indicator">
        <CheckIcon />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
};

export const Select: React.FC<{
  options: SelectOption[];
  placeholder: string;
  label: string;
  value: string | undefined;
  name?: string;
  /** Hooks for e2e: `data-qa` on the trigger, which also carries the current `data-value`; the options get `<qa>-option` with their own `data-value`. */
  qa?: string;
  onValueChange: (value: string) => void;
}> = ({ options, placeholder, label, value, name, qa, onValueChange }) => {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} name={name}>
      <RadixSelect.Trigger className="q-select" aria-label={label} data-qa={qa} data-value={qa ? value : undefined}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="q-select-icon">
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="q-select-content">
          <RadixSelect.ScrollUpButton className="q-select-scroll-button">
            <ChevronUpIcon />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="SelectViewport">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} qa={qa ? `${qa}-option` : undefined}>
                {option.label}
              </SelectItem>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="q-select-scroll-button">
            <ChevronDownIcon />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

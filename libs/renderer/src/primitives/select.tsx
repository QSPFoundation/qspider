import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import * as RadixSelect from '@radix-ui/react-select';
import { useTranslation } from 'react-i18next';

export interface SelectOption {
  label: string;
  value: string;
}

const SelectItem: React.FC<{ children: React.ReactNode; value: string }> = ({ children, ...props }) => {
  return (
    <RadixSelect.Item className="q-select-item" {...props}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="q-select-item-indicator">
        <CheckIcon />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
};

export const Select: React.FC<{
  options: SelectOption[];
  placehoder: string;
  label: string;
  value: string | undefined;
  name?: string;
  onValueChange: (value: string) => void;
}> = ({ options, placehoder, label, value, name, onValueChange }) => {
  const { t } = useTranslation();
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} name={name}>
      <RadixSelect.Trigger className="q-select" aria-label={label}>
        <RadixSelect.Value placeholder={placehoder} />
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
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
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

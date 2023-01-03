import * as RadixSelect from '@radix-ui/react-select';

export interface SelectOption {
  label: string;
  value: string;
}

const SelectItem: React.FC<{ children: React.ReactNode; value: string }> = ({ children, ...props }) => {
  return (
    <RadixSelect.Item className="SelectItem" {...props}>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="SelectItemIndicator">{/* <CheckIcon /> */}</RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
};

export const Select: React.FC<{
  options: SelectOption[];
  placehoder: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}> = ({ options, placehoder, label, value, onValueChange }) => {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger className="SelectTrigger" aria-label={label}>
        <RadixSelect.Value placeholder={placehoder} />
        <RadixSelect.Icon className="SelectIcon">{/* <ChevronDownIcon /> */}</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="SelectContent">
          <RadixSelect.ScrollUpButton className="SelectScrollButton">
            {/* <ChevronUpIcon /> */}
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="SelectViewport">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="SelectScrollButton">
            {/* <ChevronDownIcon /> */}
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

import * as RadixSwitch from '@radix-ui/react-switch';

export const Switch: React.FC<{ checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }> = ({
  checked,
  disabled,
  onChange,
}) => {
  return (
    <RadixSwitch.Root className="q-switch" checked={checked} disabled={disabled} onCheckedChange={onChange}>
      <RadixSwitch.Thumb className="q-switch-thumb" />
    </RadixSwitch.Root>
  );
};

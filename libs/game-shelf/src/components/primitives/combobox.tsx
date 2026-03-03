import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';

export interface ComboboxOption {
  label: string;
  value: string;
}

export const Combobox: React.FC<{
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder?: string;
  label: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
}> = ({ options, placeholder, searchPlaceholder, label, value, onValueChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : options;

  const selected = options.find((o) => o.value === value);

  function handleOpenChange(next: boolean): void {
    setOpen(next);
    if (!next) setSearch('');
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button className="q-select" aria-label={label}>
          <span className="q-combobox-value">
            {selected ? selected.label : <span className="q-combobox-placeholder">{placeholder}</span>}
          </span>
          <span className="q-select-icon">
            <ChevronDownIcon />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="q-select-content q-combobox-content" align="start" sideOffset={4}>
          <div className="q-combobox-search">
            <span className="q-combobox-search-icon">
              <MagnifyingGlassIcon />
            </span>
            <input
              className="q-combobox-input"
              value={search}
              onInput={(e): void => setSearch((e.target as HTMLInputElement).value)}
              placeholder={searchPlaceholder ?? ''}
              autoFocus
            />
          </div>
          <div className="q-combobox-list">
            {filtered.map((option) => (
              <div
                key={option.value}
                className="q-select-item"
                onClick={(): void => {
                  onValueChange(option.value);
                  handleOpenChange(false);
                }}
              >
                {option.value === value ? (
                  <span className="q-select-item-indicator">
                    <CheckIcon />
                  </span>
                ) : null}
                {option.label}
              </div>
            ))}
            {filtered.length === 0 && <div className="q-combobox-empty">No results</div>}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export type MenuEntry = { separator: true } | { separator: false; displayIndex: number };

/** A menu item named `-` is a separator; the shown numbers (1-based) skip separators. */
export function menuEntries(items: readonly { name: readonly unknown[] }[]): MenuEntry[] {
  let displayIndex = 1;
  return items.map((item) =>
    item.name[0] === '-' ? { separator: true } : { separator: false, displayIndex: displayIndex++ },
  );
}

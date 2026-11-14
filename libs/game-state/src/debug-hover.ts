import type { QspAPI, QspVariableKey } from '@qsp/wasm-engine';
import { isRetiredEngine, qspApi$ } from './qsp-engine';
import { describeHover, describeSummary, isArrayHover, HOVER_SUMMARY_ITEMS, type HoverPlan } from './debug-hover-logic';
import { itemWindow } from './debug-watch-logic';
import { effectivePrefix, formatQspPath, type QspField, type QspPath } from './qsp-path';
import { readHiddenValue, readPath } from './qsp-path-read';

export interface HoverReading {
  lines: string[];
  /** The variable the Pin link adds to the watch list (the array, not the item). */
  pinName?: string;
}

function readValueLines(api: QspAPI, name: string): string[] {
  const size = api.readVariableSize(name);
  if (size > 0 && isArrayHover(size, api.readVariableItem(name, 0).key)) {
    return describeSummary(name, ...summaryItems(api, name));
  }
  return describeHover(name, api.readVariable(name), readHiddenValue(api, name), size);
}

/**
 * The lines of a path with an index or fields, under the path's label. With fields, a prefix that types the value
 * also shows what is stored, and a missing field is not set; without, a missing item is not set.
 */
function readPathLines(api: QspAPI, path: QspPath): string[] {
  const { value, stored } = readPath(api, path);
  const hasFields = path.fields.length > 0;
  const hidden = hasFields && effectivePrefix(path) ? stored : undefined;
  const found = hasFields ? stored : value;
  return describeHover(formatQspPath(path), value, hidden, found === undefined ? 0 : 1);
}

/** Resolved index of a single-variable index: its value if it is a number or a string, else undefined. */
function readIndex(api: QspAPI, indexName: string): string | number | undefined {
  const value = api.readVariable(indexName);
  if (typeof value === 'number') return Number.isInteger(value) ? value : undefined;
  return typeof value === 'string' ? value : undefined;
}

/**
 * Reads what a hover shows. It only uses `readVariable*`: nothing runs engine code, so it is safe at any time
 * between engine runs.
 */
export function readHover(plan: HoverPlan): HoverReading {
  const api = qspApi$.value;
  if (plan.kind === 'none' || !api || isRetiredEngine(api)) return { lines: [] };
  const { name } = plan;
  const fields: QspField[] = plan.kind === 'summary' ? [] : (plan.fields ?? []);
  const path = (index?: QspVariableKey): QspPath => ({ name: name.toUpperCase(), index, fields });
  switch (plan.kind) {
    case 'value': {
      if (fields.length === 0) return { lines: readValueLines(api, name), pinName: name };
      const found = path();
      return { lines: readPathLines(api, found), pinName: formatQspPath(found) };
    }
    case 'item': {
      const found = path(plan.key);
      return { lines: readPathLines(api, found), pinName: formatQspPath(found) };
    }
    case 'itemByVar': {
      const index = readIndex(api, plan.indexName);
      if (index === undefined) return { lines: describeSummary(name, ...summaryItems(api, name)), pinName: name };
      return { lines: [`${plan.indexName} = ${index}`, ...readPathLines(api, path(index))], pinName: name };
    }
    case 'summary':
      return { lines: describeSummary(name, ...summaryItems(api, name)), pinName: name };
  }
}

function summaryItems(api: QspAPI, name: string) {
  const size = api.readVariableSize(name);
  const shown = [];
  for (let i = 0, count = itemWindow(size, HOVER_SUMMARY_ITEMS); i < count; i++) {
    const { key, value } = api.readVariableItem(name, i);
    shown.push({ key, value });
  }
  return [size, shown] as const;
}

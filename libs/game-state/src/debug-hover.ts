import type { QspAPI, QspVariableKey, QspVariableValue } from '@qsp/wasm-engine';
import { isRetiredEngine, qspApi$ } from './qsp-engine';
import { describeHover, describeSummary, HOVER_SUMMARY_ITEMS, type HoverPlan } from './debug-hover-logic';
import { indexText, itemWindow } from './debug-watch-logic';

export interface HoverReading {
  lines: string[];
  /** The variable the Pin link adds to the watch list (the array, not the item). */
  pinName?: string;
}

const PREFIX = /^[$#%]/;

/** The name's stored value: read without a prefix, so no type conversion hides it. */
function readRaw(api: QspAPI, name: string): QspVariableValue {
  return api.readVariable(name.replace(PREFIX, ''));
}

function readValueLines(api: QspAPI, name: string): string[] {
  const size = api.readVariableSize(name);
  return describeHover(name, api.readVariable(name), PREFIX.test(name) ? readRaw(api, name) : undefined, size);
}

function readItemLines(api: QspAPI, name: string, key: QspVariableKey): string[] {
  const label = `${name}[${typeof key === 'number' ? key : indexText(key, 0)}]`;
  const typed = typeof key === 'number' ? api.readVariableByIndex(name, key) : api.readVariableByKey(name, key);
  return describeHover(label, typed, undefined, typed === undefined ? 0 : 1);
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
  const pinName = name;
  switch (plan.kind) {
    case 'value':
      return { lines: readValueLines(api, name), pinName };
    case 'item':
      return { lines: readItemLines(api, name, plan.key), pinName };
    case 'itemByVar': {
      const index = readIndex(api, plan.indexName);
      if (index === undefined) return { lines: describeSummary(name, ...summaryItems(api, name)), pinName };
      return { lines: [`${plan.indexName} = ${index}`, ...readItemLines(api, name, index)], pinName };
    }
    case 'summary':
      return { lines: describeSummary(name, ...summaryItems(api, name)), pinName };
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

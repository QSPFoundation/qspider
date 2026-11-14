import type { QspAPI, QspVariableKey, QspVariableValue } from '@qsp/wasm-engine';
import { effectivePrefix, walkFields, type QspPath } from './qsp-path';
import { applyTypePrefix } from './variable-logic';

const PREFIX = /^[$#%]/;

/** The name's stored value: read without a prefix, so no type conversion hides it. */
export function readRaw(api: QspAPI, name: string): QspVariableValue {
  return api.readVariable(name.replace(PREFIX, ''));
}

/** What a type prefix on `name` may hide: the stored value for a prefixed name, undefined for a plain one. */
export function readHiddenValue(api: QspAPI, name: string): QspVariableValue {
  return PREFIX.test(name) ? readRaw(api, name) : undefined;
}

/** The item of `name` at `key`, as the engine reads it with the name's prefix. */
export function readItem(api: QspAPI, name: string, key: QspVariableKey): QspVariableValue {
  return typeof key === 'number' ? api.readVariableByIndex(name, key) : api.readVariableByKey(name, key);
}

/** What a path's fields are walked from: the base (or its item) read without its prefix. */
function readFieldsBase(api: QspAPI, path: QspPath): QspVariableValue {
  const name = path.name.replace(PREFIX, '');
  return path.index === undefined ? readRaw(api, name) : readItem(api, name, path.index);
}

/** A path's value, and for a path with fields, what is stored at its end before its prefix types it. */
export interface PathReading {
  value: QspVariableValue;
  /** Only for a path with fields: the value walked from the unprefixed base. */
  stored?: QspVariableValue;
}

/**
 * Reads a path with an index or fields: the item read with the base prefix, or, with fields, the unprefixed base
 * walked down its fields (`stored`) and typed by the path's effective prefix (`value`).
 */
export function readPath(api: QspAPI, path: QspPath): PathReading {
  if (path.fields.length > 0) {
    const stored = walkFields(readFieldsBase(api, path), path.fields);
    return { value: applyTypePrefix(effectivePrefix(path), stored), stored };
  }
  return { value: path.index === undefined ? api.readVariable(path.name) : readItem(api, path.name, path.index) };
}

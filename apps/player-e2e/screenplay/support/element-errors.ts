import { ListItemNotFoundError, LogicError } from '@serenity-js/core';

// WebKitWebDriver (desktop) throws a plain object, not an Error, when an element is missing:
// `{ error: 'no such element', message: '', stacktrace }`, which prints as "[object Object]".
// A stale element (re-rendered between lookup and use) is gone too.
const MISSING_ELEMENT_CODES = ['no such element', 'stale element reference'];

/**
 * Whether `error` means the element is not in the page (now): missing, stale, or no list item matched.
 * A filtered list (PageElements.where) wraps a read error of one of its items in a LogicError, so
 * that error counts when its cause does (e.g. a shelf card re-rendered while the shelf filled).
 */
export function isMissingElementError(error: unknown): boolean {
  if (error instanceof ListItemNotFoundError) return true;
  if (error instanceof LogicError) return error.cause !== undefined && isMissingElementError(error.cause);
  if (typeof error !== 'object' || error === null) return false;
  const { error: code, name } = error as { error?: unknown; name?: unknown };
  return MISSING_ELEMENT_CODES.includes(String(code)) || MISSING_ELEMENT_CODES.includes(String(name));
}

/** A readable one-line description of any thrown value, including WebDriver's plain-object errors. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message.split('\n')[0]}`;
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const { error: code, message } = error as { error: unknown; message?: unknown };
    return `WebDriver error "${String(code)}"${message ? `: ${String(message)}` : ''}`;
  }
  return String(error);
}

/** `error` as an Error, so a plain-object WebDriver error reads as more than "[object Object]". */
export function asError(error: unknown): unknown {
  return error instanceof Error ? error : new Error(describeError(error));
}

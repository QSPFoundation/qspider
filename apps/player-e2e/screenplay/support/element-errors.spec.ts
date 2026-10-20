import { ListItemNotFoundError } from '@serenity-js/core';
import { describe, expect, it } from 'vitest';
import { describeError, isMissingElementError } from './element-errors';

// The shape WebKitWebDriver's "no such element" reaches Serenity in (seen on desktop).
const noSuchElement = { error: 'no such element', message: '', stacktrace: '' };

describe('isMissingElementError', () => {
  it('accepts WebKitWebDriver plain-object "no such element" and stale-element errors', () => {
    expect(isMissingElementError(noSuchElement)).toBe(true);
    expect(isMissingElementError({ error: 'stale element reference', message: '' })).toBe(true);
  });
  it('accepts a WebdriverIO error named "no such element" and a ListItemNotFoundError', () => {
    expect(isMissingElementError(Object.assign(new Error('x'), { name: 'no such element' }))).toBe(true);
    expect(isMissingElementError(new ListItemNotFoundError('no item'))).toBe(true);
  });
  it('rejects other errors', () => {
    expect(isMissingElementError({ error: 'element click intercepted', message: '' })).toBe(false);
    expect(isMissingElementError(new Error('no such element'))).toBe(false);
    expect(isMissingElementError(undefined)).toBe(false);
  });
});

describe('describeError', () => {
  it('describes a plain-object WebDriver error by its code', () => {
    expect(describeError(noSuchElement)).toBe('WebDriver error "no such element"');
  });
  it('describes an Error by name and first message line', () => {
    expect(describeError(new TypeError('bad\nmore'))).toBe('TypeError: bad');
  });
});

import { describe, expect, it } from 'vitest';
import { keptEntry, webviewDataLeft, webviewProfileDir } from './webview-data';

describe('webviewDataLeft', () => {
  it('finds nothing in a cleared page', () => {
    expect(webviewDataLeft({ indexedDb: [], localStorage: 0, sessionStorage: 0, caches: 0 })).toEqual([]);
  });

  it('treats a page without Cache Storage as cleared', () => {
    expect(webviewDataLeft({ indexedDb: [], localStorage: 0, sessionStorage: 0, caches: null })).toEqual([]);
  });

  it('names every kind of data left', () => {
    expect(webviewDataLeft({ indexedDb: ['qspider', 'saves'], localStorage: 2, sessionStorage: 1, caches: 3 })).toEqual(
      ['IndexedDB qspider, saves', '2 local storage item(s)', '1 session storage item(s)', '3 Cache Storage cache(s)'],
    );
  });
});

describe('webviewProfileDir', () => {
  it('is EBWebView inside the user data folder', () => {
    expect(webviewProfileDir('C:\\Users\\ci\\AppData\\Local\\org.qsp.qspider')).toBe(
      'C:\\Users\\ci\\AppData\\Local\\org.qsp.qspider\\EBWebView',
    );
  });
});

describe('keptEntry', () => {
  const local = 'C:\\Users\\ci\\AppData\\Local\\org.qsp.qspider';
  const profile = `${local}\\EBWebView`;

  it('keeps the profile folder of the dir that holds it', () => {
    expect(keptEntry(local, profile)).toBe('EBWebView');
  });

  it('matches the dir case-insensitively and with a trailing or forward separator', () => {
    expect(keptEntry('c:\\users\\ci\\appdata\\local\\ORG.QSP.QSPIDER\\', profile)).toBe('EBWebView');
    expect(keptEntry('C:/Users/ci/AppData/Local/org.qsp.qspider', profile)).toBe('EBWebView');
  });

  it('keeps nothing in the other app data dirs', () => {
    expect(keptEntry('C:\\Users\\ci\\AppData\\Roaming\\org.qsp.qspider', profile)).toBeNull();
    expect(keptEntry('C:\\Users\\ci\\AppData\\Local\\org.qsp.e2e.standalone', profile)).toBeNull();
  });

  it('keeps nothing deeper down or when nothing is to be kept', () => {
    expect(keptEntry('C:\\Users\\ci\\AppData\\Local', profile)).toBeNull();
    expect(keptEntry(local, undefined)).toBeNull();
  });
});

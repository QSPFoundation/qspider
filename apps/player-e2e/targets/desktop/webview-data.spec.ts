import { describe, expect, it } from 'vitest';
import { clearOutcome, keptEntry, webviewProfileDir } from './webview-data';

describe('clearOutcome', () => {
  it('reads the URL the app goes to when the clear is done', () => {
    expect(clearOutcome('about:blank#cleared')).toBe('cleared');
    expect(clearOutcome('about:blank#failed')).toBe('failed');
  });

  it('is pending on the app page and on the bare about:blank the clear runs on', () => {
    expect(clearOutcome('https://tauri.localhost/')).toBe('pending');
    expect(clearOutcome('about:blank')).toBe('pending');
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

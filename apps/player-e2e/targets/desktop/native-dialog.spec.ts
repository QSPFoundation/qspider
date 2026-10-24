import { describe, expect, it } from 'vitest';
import { driverDetails, driverFailure, hasReadyLine } from './native-dialog';

describe('driverFailure', () => {
  it("keeps a driver's one-line failure as it is", () => {
    expect(driverFailure('dialog not found\r\n', 'win32')).toBe('dialog not found');
    expect(driverFailure('value not set (read back "C:\\x\\игра.qsps")\n', 'win32')).toBe(
      'value not set (read back "C:\\x\\игра.qsps")',
    );
    expect(driverFailure('The native file dialog did not appear within 10s\n', 'linux')).toBe(
      'The native file dialog did not appear within 10s',
    );
  });
  it('drops a leading UTF-8 BOM', () => {
    expect(driverFailure('\uFEFFdialog not found\r\n', 'win32')).toBe('dialog not found');
  });
  it('keeps the first line and the FullyQualifiedErrorId of a PowerShell error record on Windows', () => {
    const record = [
      'At C:\\a\\dialog.ps1:12 char:3',
      '+   $x = (',
      '+         ~',
      "Missing ')' in expression.",
      '    + CategoryInfo          : ParserError: (:) [], ParseException',
      '    + FullyQualifiedErrorId : MissingEndParenthesisInExpression',
      '',
    ].join('\r\n');
    expect(driverFailure(record, 'win32')).toBe('At C:\\a\\dialog.ps1:12 char:3 (MissingEndParenthesisInExpression)');
    expect(driverFailure('first\r\nsecond\r\n', 'win32')).toBe('first');
  });
  it('keeps the last line of a multi-line failure on Linux (a Python traceback ends with the error)', () => {
    expect(driverFailure('Traceback (most recent call last):\n  File "x"\nValueError: boom\n', 'linux')).toBe(
      'ValueError: boom',
    );
  });
  it("keeps the message apart from dialog.ps1's '|' detail lines", () => {
    const stderr = [
      'file name field not found',
      '| #32770 candidates: 1',
      "|   ControlType.ComboBox class='ComboBox' id='1148' name=''",
      '',
    ].join('\r\n');
    expect(driverFailure(stderr, 'win32')).toBe('file name field not found');
    expect(driverDetails(stderr)).toEqual([
      '| #32770 candidates: 1',
      "|   ControlType.ComboBox class='ComboBox' id='1148' name=''",
    ]);
    expect(driverDetails('dialog not found\r\n')).toEqual([]);
  });
  it('returns an empty string for empty stderr', () => {
    expect(driverFailure('', 'win32')).toBe('');
    expect(driverFailure('\n', 'linux')).toBe('');
  });
});

describe('hasReadyLine', () => {
  it('sees the ready line once it is complete, after a BOM, with CRLF or LF', () => {
    expect(hasReadyLine('READY\r\n')).toBe(true);
    expect(hasReadyLine('\uFEFFREADY\r\n')).toBe(true);
    expect(hasReadyLine('READY\n')).toBe(true);
    expect(hasReadyLine('loading\r\nREADY\r\nmore')).toBe(true);
  });
  it('waits for the end of the line', () => {
    expect(hasReadyLine('')).toBe(false);
    expect(hasReadyLine('REA')).toBe(false);
    expect(hasReadyLine('READY')).toBe(false);
  });
  it('takes only the exact line', () => {
    expect(hasReadyLine('NOT READY\r\n')).toBe(false);
    expect(hasReadyLine('READYING\n')).toBe(false);
    expect(hasReadyLine('ready\n')).toBe(false);
  });
});

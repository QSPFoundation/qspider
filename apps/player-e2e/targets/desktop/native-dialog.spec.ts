import { describe, expect, it } from 'vitest';
import { driverFailure } from './native-dialog';

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
  it('returns an empty string for empty stderr', () => {
    expect(driverFailure('', 'win32')).toBe('');
    expect(driverFailure('\n', 'linux')).toBe('');
  });
});

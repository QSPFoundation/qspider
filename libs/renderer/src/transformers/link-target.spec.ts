import { describe, expect, it } from 'vitest';
import { linkTarget } from './link-target';

describe('linkTarget', () => {
  it('runs the code after exec: as QSP code', () => {
    expect(linkTarget("exec:gt 'shop'")).toEqual({ kind: 'exec', code: "gt 'shop'" });
  });

  it('reads the exec: prefix in any case', () => {
    expect(linkTarget("EXEC:gt 'shop'")).toEqual({ kind: 'exec', code: "gt 'shop'" });
  });

  it('keeps the spaces after exec: in the code', () => {
    expect(linkTarget('exec: x = 1')).toEqual({ kind: 'exec', code: ' x = 1' });
  });

  it('selects the action a positive number names', () => {
    expect(linkTarget('3')).toEqual({ kind: 'action', number: 3 });
  });

  it('takes the leading number of a href that starts with digits', () => {
    expect(linkTarget('12abc')).toEqual({ kind: 'action', number: 12 });
  });

  it('treats 0 as a plain link', () => {
    expect(linkTarget('0')).toEqual({ kind: 'link' });
  });

  it('treats a negative number as a plain link', () => {
    expect(linkTarget('-2')).toEqual({ kind: 'link' });
  });

  it('treats a web address as a plain link', () => {
    expect(linkTarget('https://example.com/page')).toEqual({ kind: 'link' });
  });

  it('treats an anchor as a plain link', () => {
    expect(linkTarget('#top')).toEqual({ kind: 'link' });
  });

  it('treats a missing or empty href as a plain link', () => {
    expect(linkTarget(undefined)).toEqual({ kind: 'link' });
    expect(linkTarget('')).toEqual({ kind: 'link' });
  });
});

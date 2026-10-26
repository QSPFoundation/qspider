import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { errorMessage$, isErrorShown$, isNoticeShown$, noticeMessage$, showError, showNotice } from './toasts';

describe('toasts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('showError sets the message and shows it without expiry', () => {
    showError('Boom');
    expect(errorMessage$.value).toBe('Boom');
    expect(isErrorShown$.value).toBe(true);
    vi.advanceTimersByTime(60_000);
    expect(isErrorShown$.value).toBe(true);
  });

  it('showNotice shows the notice and hides it after 3 seconds', () => {
    showNotice('Saved');
    expect(noticeMessage$.value).toBe('Saved');
    expect(isNoticeShown$.value).toBe(true);
    vi.advanceTimersByTime(2999);
    expect(isNoticeShown$.value).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isNoticeShown$.value).toBe(false);
  });

  it('a second notice restarts the 3 second expiry', () => {
    showNotice('First');
    vi.advanceTimersByTime(2000);
    showNotice('Second');
    vi.advanceTimersByTime(2000);
    expect(noticeMessage$.value).toBe('Second');
    expect(isNoticeShown$.value).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(isNoticeShown$.value).toBe(false);
  });
});

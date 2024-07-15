import { atom } from 'xoid';

export const errorMessage$ = atom('');
export const isErrorShown$ = atom(false);

export function showError(message: string): void {
  errorMessage$.set(message);
  isErrorShown$.set(true);
}

export const noticeMessage$ = atom('');
export const isNoticeShown$ = atom(false);
let noticeTimeout: ReturnType<typeof setTimeout> | null = null;

export function showNotice(message: string): void {
  noticeMessage$.set(message);
  isNoticeShown$.set(true);
  if (noticeTimeout) clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => {
    isNoticeShown$.set(false);
  }, 3000);
}

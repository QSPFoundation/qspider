import { IWindowManager } from '@qspider/contracts';

export const windowManager: IWindowManager = {
  resize(): void {
    // noop in web
  },
  setResizable(): void {
    // noop in web
  },
  setMinSize(): void {
    // noop in web
  },
  unsetMinSize(): void {
    // noop in web
  },
  setTitle(title: string): void {
    document.title = title;
  },
  setIcon(icon: string): void {
    (document.getElementById('favicon') as HTMLLinkElement).href = icon;
  },
};

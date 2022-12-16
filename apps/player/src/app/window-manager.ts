import { IWindowManager } from '@qspider/contracts';

export const windowManager: IWindowManager = {
  setTitle(title: string): void {
    document.title = title;
  },
  setIcon(icon: string): void {
    (document.getElementById('favicon') as HTMLLinkElement).href = icon;
  },
};

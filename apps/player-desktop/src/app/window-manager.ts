import { IWindowManager } from '@qspider/contracts';
import { appWindow, LogicalSize } from '@tauri-apps/api/window.js';
import { os } from '@tauri-apps/api/index.js';
import { imageToIco, reagPng } from './images';

export const windowManager: IWindowManager = {
  resize(width: number, height: number): void {
    appWindow.setSize(new LogicalSize(width, height)).then(() => appWindow.center());
  },
  setMinSize(width: number, height: number): void {
    appWindow.setMinSize(new LogicalSize(width, height));
  },
  unsetMinSize(): void {
    appWindow.setMinSize(undefined);
  },
  setResizable(isResizable: boolean): void {
    appWindow.setResizable(isResizable);
  },
  setTitle(title: string): void {
    appWindow.setTitle(title);
  },
  async setIcon(icon: string): Promise<void> {
    const platform = await os.platform();
    console.log(platform);
    if (platform === 'win32' || platform === 'windows') {
      appWindow.setIcon(Array.from(new Uint8Array(await imageToIco(icon))));
    } else {
      appWindow.setIcon(Array.from(new Uint8Array(await reagPng(icon))));
    }
  },
};

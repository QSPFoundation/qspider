import { IWindowManager } from '@qspider/contracts';
import { currentMonitor, getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalSize, PhysicalSize } from '@tauri-apps/api/dpi';
import { platform } from '@tauri-apps/plugin-os';
import { exit } from '@tauri-apps/plugin-process';
import { fetchBinaryContent } from './data-fetcher';
import { adjustHeightFor, clampToMonitor, windowPlatformName } from './window-geometry';

const appWindow = getCurrentWindow();

export const windowManager: IWindowManager = {
  isBrowser: false,
  platform: '',
  async resize(width: number, height: number): Promise<void> {
    const monitor = await currentMonitor();
    if (monitor) {
      const monitorSize = new PhysicalSize(monitor.size.width, monitor.size.height).toLogical(monitor.scaleFactor);
      width = clampToMonitor(width, monitorSize.width);
      height = clampToMonitor(height, monitorSize.height);
    }
    appWindow.setSize(new LogicalSize(width, await adjustHeight(height)));
  },
  async setMinSize(width: number, height: number): Promise<void> {
    appWindow.setMinSize(new LogicalSize(width, await adjustHeight(height)));
  },
  unsetMinSize(): void {
    appWindow.setMinSize(null);
  },
  async setMaxSize(width: number, height: number): Promise<void> {
    appWindow.setMaxSize(new LogicalSize(width, await adjustHeight(height)));
  },
  unsetMaxSize(): void {
    appWindow.setMaxSize(null);
  },
  setResizable(isResizable: boolean): void {
    appWindow.setResizable(isResizable);
  },
  setTitle(title: string): void {
    appWindow.setTitle(title);
  },
  async setIcon(baseUrl: string, icon: string): Promise<void> {
    const source = await fetchBinaryContent(baseUrl, icon);
    appWindow.setIcon(new Uint8Array(source));
  },
  async goFullscreen(): Promise<void> {
    await appWindow.setFullscreen(true);
  },
  async goWindowed(): Promise<void> {
    await appWindow.setFullscreen(false);
  },
  closeWindow(): void {
    exit(0);
  },
};

async function adjustHeight(height: number): Promise<number> {
  return adjustHeightFor(platform(), height);
}

const resolvedPlatform = windowPlatformName(platform());
if (resolvedPlatform) {
  windowManager.platform = resolvedPlatform;
}

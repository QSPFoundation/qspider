import { IWindowManager } from '@qspider/contracts';
import { appWindow, currentMonitor, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';
import { type, platform } from '@tauri-apps/api/os';

export const windowManager: IWindowManager = {
  isBrowser: false,
  platform: '',
  async resize(width: number, height: number): Promise<void> {
    const monitor = await currentMonitor();
    if (monitor) {
      const monitorSize = new PhysicalSize(monitor.size.width, monitor.size.height).toLogical(monitor.scaleFactor);
      if (width > monitorSize.width - 1) {
        width = monitorSize.width - 1;
      }
      if (height > monitorSize.height - 1) {
        height = monitorSize.height - 1;
      }
    }
    appWindow.setSize(new LogicalSize(width, await adjustHeight(height)));
  },
  async setMinSize(width: number, height: number): Promise<void> {
    appWindow.setMinSize(new LogicalSize(width, await adjustHeight(height)));
  },
  unsetMinSize(): void {
    appWindow.setMinSize(undefined);
  },
  async setMaxSize(width: number, height: number): Promise<void> {
    appWindow.setMaxSize(new LogicalSize(width, await adjustHeight(height)));
  },
  unsetMaxSize(): void {
    appWindow.setMaxSize(undefined);
  },
  setResizable(isResizable: boolean): void {
    appWindow.setResizable(isResizable);
  },
  setTitle(title: string): void {
    appWindow.setTitle(title);
  },
  async setIcon(icon: string): Promise<void> {
    const source = await fetch(icon).then((r) => r.arrayBuffer());
    appWindow.setIcon(new Uint8Array(source));
  },
  async goFullscreen(): Promise<void> {
    await appWindow.setFullscreen(true);
  },
  async goWindowed(): Promise<void> {
    await appWindow.setFullscreen(false);
  },
};

// solwing a bug https://github.com/tauri-apps/tauri/issues/6333
async function adjustHeight(height: number): Promise<number> {
  const isMacOS = (await platform()) === 'darwin';
  return isMacOS ? height + 28 : height;
}

const platformsMap = {
  Darwin: 'Macintosh',
  Linux: 'Linux',
  Windows_NT: 'Windows',
};
type().then((type) => {
  const resolved = platformsMap[type];
  if (resolved) {
    windowManager.platform = resolved;
  }
});

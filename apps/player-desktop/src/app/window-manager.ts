import { IWindowManager } from '@qspider/contracts';
import { appWindow, currentMonitor, LogicalSize, PhysicalSize } from '@tauri-apps/api/window';

export const windowManager: IWindowManager = {
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
    appWindow.setSize(new LogicalSize(width, height));
  },
  setMinSize(width: number, height: number): void {
    appWindow.setMinSize(new LogicalSize(width, height));
  },
  unsetMinSize(): void {
    appWindow.setMinSize(undefined);
  },
  setMaxSize(width: number, height: number): void {
    appWindow.setMaxSize(new LogicalSize(width, height));
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

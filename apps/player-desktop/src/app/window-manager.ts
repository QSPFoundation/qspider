import { IWindowManager } from '@qspider/contracts';
import { window } from '@tauri-apps/api';

export const windowManager: IWindowManager = {
  async resize(width: number, height: number): Promise<void> {
    const monitor = await window.currentMonitor();
    if (monitor) {
      const monitorSize = new window.PhysicalSize(monitor.size.width, monitor.size.height).toLogical(
        monitor.scaleFactor
      );
      if (width > monitorSize.width - 1) {
        width = monitorSize.width - 1;
      }
      if (height > monitorSize.height - 1) {
        height = monitorSize.height - 1;
      }
    }
    window.appWindow.setSize(new window.LogicalSize(width, height)).then(() => window.appWindow.center());
  },
  setMinSize(width: number, height: number): void {
    window.appWindow.setMinSize(new window.LogicalSize(width, height));
  },
  unsetMinSize(): void {
    window.appWindow.setMinSize(undefined);
  },
  setResizable(isResizable: boolean): void {
    window.appWindow.setResizable(isResizable);
  },
  setTitle(title: string): void {
    window.appWindow.setTitle(title);
  },
  async setIcon(icon: string): Promise<void> {
    const source = await fetch(icon).then((r) => r.arrayBuffer());
    window.appWindow.setIcon(new Uint8Array(source));
  },
};
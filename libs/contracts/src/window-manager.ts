export interface IWindowManager {
  isBrowser: boolean;
  platform: string;
  setTitle(title: string): void;
  setIcon(icon: string): void;
  setMinSize(width: number, height: number): Promise<void>;
  unsetMinSize(): void;
  setMaxSize(width: number, height: number): Promise<void>;
  unsetMaxSize(): void;
  setResizable(isResizable: boolean): void;
  resize(width: number, height: number): Promise<void>;
  goFullscreen(): void;
  goWindowed(): void;
  closeWindow(): void;
}

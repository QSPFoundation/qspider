export interface IWindowManager {
  setTitle(title: string): void;
  setIcon(icon: string): void;
  setMinSize(width: number, height: number): void;
  unsetMinSize(): void;
  setMaxSize(width: number, height: number): void;
  unsetMaxSize(): void;
  setResizable(isResizable: boolean): void;
  resize(width: number, height: number): void;
  goFullscreen(): void;
  goWindowed(): void;
}

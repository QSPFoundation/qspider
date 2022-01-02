export interface IWindowManager {
  resize(width: number, height: number): void;
  setMinSize(width: number, height: number): void;
  unsetMinSize(): void;
  setTitle(title: string): void;
  setResizable(isResizable: boolean): void;
  setIcon(icon: string): void;
}

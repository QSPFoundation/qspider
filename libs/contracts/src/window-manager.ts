export interface IWindowManager {
  setTitle(title: string): void;
  setIcon(icon: string): void;
  goFullscreen(): void;
  goWindowed(): void;
}

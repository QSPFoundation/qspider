export interface IGameManager {
  execCode(code: string): void;
  selectAction(index: number): void;
  executeSelAction(): void;
  onLinkClicked(href: string): void;
}

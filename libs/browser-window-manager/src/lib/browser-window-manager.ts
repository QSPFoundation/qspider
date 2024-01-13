import { IWindowManager } from '@qspider/contracts';

const MIN_SIZE_ID = 'min-size-style';
const MAX_SIZE_ID = 'max-size-style';

export const windowManager: IWindowManager = {
  setTitle(title: string): void {
    document.title = title;
  },
  setIcon(icon: string): void {
    (document.getElementById('favicon') as HTMLLinkElement).href = icon;
  },
  goFullscreen(): void {
    if (!document.fullscreenEnabled) return;
    console.log(document.querySelector('qsp-game-root'));
    document
      .querySelector('qsp-game-root')
      ?.requestFullscreen()
      .catch(() => {
        function doTry(): void {
          document.querySelector('qsp-game-root')?.requestFullscreen();
          document.removeEventListener('click', doTry);
        }
        document.addEventListener('click', doTry);
      });
  },
  goWindowed(): void {
    if (!document.fullscreenEnabled) return;
    document.exitFullscreen();
  },
  async setMinSize(width: number, height: number): Promise<void> {
    const style = document.createElement('style');
    style.innerText = `qsp-game-root {min-width: ${width}px;min-height:${height}px;}`;
    style.id = MIN_SIZE_ID;
    document.body.appendChild(style);
  },
  unsetMinSize(): void {
    document.getElementById(MIN_SIZE_ID)?.remove();
  },
  async setMaxSize(width: number, height: number): Promise<void> {
    const style = document.createElement('style');
    style.innerText = `qsp-game-root {max-width: ${width}px;max-height:${height}px;}`;
    style.id = MAX_SIZE_ID;
    document.body.appendChild(style);
  },
  unsetMaxSize(): void {
    document.getElementById(MAX_SIZE_ID)?.remove();
  },
  setResizable(_isResizable: boolean): void {
    // noop in browser
  },
  async resize(_width: number, _height: number): Promise<void> {
    // noop in browser
  },
};

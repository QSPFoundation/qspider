import { IWindowManager } from '@qspider/contracts';

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
  goWindowed: function (): void {
    if (!document.fullscreenEnabled) return;
    document.exitFullscreen();
  },
};

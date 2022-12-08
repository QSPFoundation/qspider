export * from './game-shelf';
export * from './game-runner';
export * from './theme-core';
export * from './error-alert';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'qsp-game-root': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-stats': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-actions': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-objects': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-cmd': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-view': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-msg': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen-content': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen-credits': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen-save': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen-load': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen-preferences': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-region': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export * from './root';
export * from './theme-core';
export * from './loader';
export * from './content-renderer';
export * from './game-runner';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'qsp-game-root': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-main': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-main-content': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-stats': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-stats-content': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-actions': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-actions-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-action': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-action-name': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-action-index': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-objects': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-objects-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-object': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-object-name': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-object-index': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-cmd': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-view': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-menu-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-menu-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-menu-name': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-menu-index': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-menu-separator': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-msg': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-msg-content': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-input-content': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen-content': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-pause-screen-panel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-slots-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-save-slot': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-slot-index': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-slot-date': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-region': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-cl': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-cl-layer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-cl-dock': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-cl-pane': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-layer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-variable': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-mute-toggle': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-global-hotkeys': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-game-hotkeys': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-hotkey': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-hotkey-description': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-hotkey-keys': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-locale-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-game-title': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-game-author': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-game-version': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'qsp-game-description': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

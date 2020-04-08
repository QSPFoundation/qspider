import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { decorate, observable, action, computed } from 'mobx';
import { useGameManager, GameManager } from './manager';
import { QspPanel, LayoutSettings } from '@qspider/qsp-wasm';

class Layout {
  useHtml = false;
  backgroundColor: string;
  backgroundImage: string;
  color: string;
  linkColor: string;
  fontSize: number;
  fontName: string;

  isStatsPanelVisible = true;
  isObjectPanelVisible = true;
  isActionsPanelVisible = true;
  isUserInputPanelVisible = true;

  constructor(manager: GameManager) {
    this.initialized(manager);
  }

  // TODO find better way to manage layout
  get templateAreas(): string {
    const rows = [];
    if (this.isObjectPanelVisible) {
      rows.push('main main objects');
    } else {
      rows.push('main main main');
    }
    if (!this.isActionsPanelVisible && !this.isStatsPanelVisible) {
      rows.push('main main main');
      if (!this.isUserInputPanelVisible) {
        rows.push('main main main');
      }
    } else if (this.isActionsPanelVisible && this.isStatsPanelVisible) {
      rows.push('actions stats stats');
      if (!this.isUserInputPanelVisible) {
        rows.push('actions stats stats');
      }
    } else {
      if (this.isActionsPanelVisible) {
        rows.push('actions actions actions');
        if (!this.isUserInputPanelVisible) {
          rows.push('actions actions actions');
        }
      } else {
        rows.push('stats stats stats');
        if (!this.isUserInputPanelVisible) {
          rows.push('stats stats stats');
        }
      }
    }
    if (this.isUserInputPanelVisible) {
      rows.push('user-input user-input user-input');
    }

    return rows.map((row) => `"${row}"`).join(' ');
  }

  async initialized(manager: GameManager) {
    await manager.apiInitialized;
    this.initCallbacks(manager);
  }

  initCallbacks(manager: GameManager) {
    manager.on('panel_visibility', this.updatePanalVisibility);
    manager.on('layout', this.updateLayoutSettings);
  }

  updateLayoutSettings = (settings: LayoutSettings) => {
    this.useHtml = settings.useHtml;
    this.backgroundColor = settings.backgroundColor;
    this.backgroundImage = settings.backgroundImage;
    this.color = settings.color;
    this.linkColor = settings.linkColor;
    this.fontSize = settings.fontSize;
    this.fontName = settings.fontName;
  };

  updatePanalVisibility = (type: QspPanel, isShown: boolean) => {
    switch (type) {
      case QspPanel.VARS:
        this.isStatsPanelVisible = isShown;
        break;
      case QspPanel.ACTS:
        this.isActionsPanelVisible = isShown;
        break;
      case QspPanel.OBJS:
        this.isObjectPanelVisible = isShown;
        break;
      case QspPanel.INPUT:
        this.isUserInputPanelVisible = isShown;
    }
  };
}

decorate(Layout, {
  useHtml: observable,
  backgroundColor: observable,
  backgroundImage: observable,
  color: observable,
  linkColor: observable,
  fontSize: observable,
  fontName: observable,

  isStatsPanelVisible: observable,
  isObjectPanelVisible: observable,
  isActionsPanelVisible: observable,
  isUserInputPanelVisible: observable,

  templateAreas: computed,

  updateLayoutSettings: action,
  updatePanalVisibility: action,
});

function createLayout(manager: GameManager) {
  return new Layout(manager);
}

const layoutContext = React.createContext<Layout | null>(null);

export const LayoutProvider = ({ children }) => {
  const manager = useGameManager();
  const store = useLocalStore(createLayout, manager);
  return (
    <layoutContext.Provider value={store}>{children}</layoutContext.Provider>
  );
};

export const useLayout = () => {
  const layout = React.useContext(layoutContext);
  if (!layout) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useLayout must be used within a StoreProvider.');
  }
  return layout;
};

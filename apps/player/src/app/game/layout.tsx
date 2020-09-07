import React from 'react';
import { useLocalStore } from 'mobx-react-lite';
import { decorate, observable, action, computed } from 'mobx';
import { useGameManager, GameManager } from './manager';
import { QspPanel, LayoutSettings } from '@qspider/qsp-wasm';
import { PlayerTheme } from '../theme.types';
import { LayoutDock, LayoutPanel } from './cfg-converter';
import { QspGUIPanel } from '../constants';

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

  constructor(private manager: GameManager) {
    this.initialized(manager);
  }

  get theme(): PlayerTheme {
    return {
      backgroundColor: this.backgroundColor || '#efefef',
      backgroundImage: this.backgroundImage ? `url(${this.manager.resourcePrefix}${this.backgroundImage})` : 'none',
      textColor: this.color,
      fontSize: this.fontSize || 16,
      fontName: this.fontName,
      borderColor: 'grey',
      buttonBackground: `#3c6478`,
      buttonColor: '#ffffff',
    };
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

  get visibleLayout(): LayoutDock[] {
    return this.manager.layout.map(this.processDock).filter(Boolean);
  }

  get floatingPanels(): [string, number, number][] {
    return this.manager.floating.filter(([name]) => this.isPanelVisible(name));
  }

  processDock = (dock: LayoutDock): LayoutDock => {
    if ((dock[0] as QspGUIPanel) === QspGUIPanel.Main) {
      return dock;
    }
    if (dock[0] === 'center') {
      return [dock[0], dock[1], (dock[2] as LayoutDock[]).map(this.processDock).filter(Boolean)];
    }
    const filteredChildren = this.filterPanels(dock[2] as LayoutPanel[]);
    if (filteredChildren && filteredChildren.length > 0) {
      return [dock[0], dock[1], filteredChildren];
    }
    return null;
  };

  filterPanels = (panels: LayoutPanel[]): LayoutPanel[] => {
    return panels && panels.filter(([name]) => this.isPanelVisible(name));
  };

  isPanelVisible(name: QspGUIPanel): boolean {
    switch (name) {
      case QspGUIPanel.Actions:
        return this.isActionsPanelVisible;
      case QspGUIPanel.ImageView:
        return this.manager.isViewShown;
      case QspGUIPanel.Objects:
        return this.isObjectPanelVisible;
      case QspGUIPanel.Stats:
        return this.isStatsPanelVisible;
      case QspGUIPanel.Input:
        return this.isUserInputPanelVisible;
    }
    return true;
  }
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

  theme: computed,
  visibleLayout: computed,

  updateLayoutSettings: action,
  updatePanalVisibility: action,
});

function createLayout(source: { manager: GameManager }) {
  return new Layout(source.manager);
}

const layoutContext = React.createContext<Layout | null>(null);

export const LayoutProvider: React.FC = ({ children }) => {
  const manager = useGameManager();
  const store = useLocalStore(createLayout, { manager });
  return <layoutContext.Provider value={store}>{children}</layoutContext.Provider>;
};

export const useLayout = (): Layout => {
  const layout = React.useContext(layoutContext);
  if (!layout) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useLayout must be used within a StoreProvider.');
  }
  return layout;
};

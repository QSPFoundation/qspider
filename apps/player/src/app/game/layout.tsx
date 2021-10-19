import React, { useState } from 'react';
import { observable, action, computed, makeObservable, autorun, reaction } from 'mobx';
import { useGameManager, GameManager } from './manager';
import { QspPanel, LayoutSettings } from '@qspider/qsp-wasm';
import { LayoutDock, LayoutPanel } from './cfg-converter';
import { QspGUIPanel } from '../constants';
import { CfgData } from './cfg-parser';
import { ResourceManager, useResources } from './resource-manager';
import { Theme } from '@emotion/react';

const classicDefaults = {
  defaultBackgroundColor: '#e0e0e0',
  defaultColor: '#000000',
  defaultLinkColor: '#0000ff',
  defaultFontSize: 12,
  defaultFontName: '',
};

const aeroDefaults = {
  defaultBackgroundColor: '#e5e5e5',
  defaultColor: '#000000',
  defaultLinkColor: '#0000ff',
  defaultFontSize: 18,
  defaultFontName: 'sans-serif',
};

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

  defaultBackgroundColor = '#e0e0e0';
  defaultColor = '#000000';
  defaultLinkColor = '#0000ff';
  defaultFontSize = 12;
  defaultFontName = '';
  currentMode = '';

  constructor(private manager: GameManager, private resources: ResourceManager) {
    makeObservable(this, {
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
    this.initialized(manager);
  }

  get theme(): Theme {
    return {
      backgroundColor: this.backgroundColor || this.defaultBackgroundColor,
      backgroundImage: this.backgroundImage ? `url("${this.resources.get(this.backgroundImage).url}")` : 'none',
      textColor: this.color || this.defaultColor,
      fontSize: this.fontSize || this.defaultFontSize,
      fontName: this.fontName || this.defaultFontName,
      borderColor: 'grey',
      linkColor: this.linkColor || this.defaultLinkColor,
    };
  }

  async initialized(manager: GameManager) {
    await manager.apiInitialized;
    this.initCallbacks(manager);
    reaction(
      () => this.manager.currentGame,
      (descriptor) => {
        this.currentMode = descriptor.mode;
        if (descriptor.mode === 'aero') {
          this.fillAeroDefaults();
        } else {
          this.fillClassicDefaults();
          if (manager.gameConfig) {
            this.fillDefaultsFromConfig(manager.gameConfig);
          }
        }
      }
    );
  }

  fillDefaultsFromConfig(config: CfgData) {
    if (config) {
      if (config.Colors) {
        this.defaultBackgroundColor = this.convertColor(config.Colors.BackColor, false);
        this.defaultColor = this.convertColor(config.Colors.FontColor, false);
        this.defaultLinkColor = this.convertColor(config.Colors.LinkColor, false);
      }
      if (config.Font) {
        this.defaultFontName = config.Font.FontName;
        this.defaultFontSize = config.Font.FontSize;
      }
    }
  }

  fillAeroDefaults(): void {
    this.defaultFontName = aeroDefaults.defaultFontName;
    this.defaultFontSize = aeroDefaults.defaultFontSize;
    this.defaultBackgroundColor = aeroDefaults.defaultBackgroundColor;
    this.defaultColor = aeroDefaults.defaultColor;
    this.defaultLinkColor = aeroDefaults.defaultLinkColor;
  }

  fillClassicDefaults(): void {
    this.defaultFontName = classicDefaults.defaultFontName;
    this.defaultFontSize = classicDefaults.defaultFontSize;
    this.defaultBackgroundColor = classicDefaults.defaultBackgroundColor;
    this.defaultColor = classicDefaults.defaultColor;
    this.defaultLinkColor = classicDefaults.defaultLinkColor;
  }

  initCallbacks(manager: GameManager) {
    manager.on('panel_visibility', this.updatePanalVisibility);
    manager.on('layout', this.updateLayoutSettings);
  }

  updateLayoutSettings = (settings: LayoutSettings) => {
    this.useHtml = settings.useHtml || this.currentMode === 'aero';
    this.backgroundColor = settings.backgroundColor ? this.convertColor(settings.backgroundColor) : null;
    this.backgroundImage = settings.backgroundImage;
    this.color = settings.color ? this.convertColor(settings.color) : null;
    this.linkColor = settings.linkColor ? this.convertColor(settings.linkColor) : null;
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

  private convertColor(value: number, withAlpha = true): string {
    const arr = new Uint8Array(4);
    const view = new DataView(arr.buffer);
    view.setInt32(0, value);

    if (withAlpha) {
      const [alpha, blue, green, red] = arr;
      return `rgba(${red},${green},${blue},${alpha})`;
    }

    const [, blue, green, red] = arr;
    return `rgb(${red},${green},${blue})`;
  }
}

const layoutContext = React.createContext<Layout | null>(null);

export const LayoutProvider: React.FC = ({ children }) => {
  const manager = useGameManager();
  const resources = useResources();
  const [layout] = useState(() => new Layout(manager, resources));
  return <layoutContext.Provider value={layout}>{children}</layoutContext.Provider>;
};

export const useLayout = (): Layout => {
  const layout = React.useContext(layoutContext);
  if (!layout) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useLayout must be used within a StoreProvider.');
  }
  return layout;
};

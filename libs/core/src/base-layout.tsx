import { observable, action, computed, makeObservable, autorun, reaction } from 'mobx';
import { convertColor } from '@qspider/utils';
import { BaseLayoutDefaults, IResourceManager, QspGUIPanel } from '@qspider/contracts';
import { GameManager } from './manager';
import { QspPanel, LayoutSettings } from '@qspider/qsp-wasm';
import { Theme } from '@emotion/react';

// TODO move defaults and fill
// const classicDefaults = {
//   defaultBackgroundColor: '#e0e0e0',
//   defaultColor: '#000000',
//   defaultLinkColor: '#0000ff',
//   defaultFontSize: 12,
//   defaultFontName: '',
// };

// const aeroDefaults = {
//   defaultBackgroundColor: '#e5e5e5',
//   defaultColor: '#000000',
//   defaultLinkColor: '#0000ff',
//   defaultFontSize: 18,
//   defaultFontName: 'sans-serif',
// };

class Layout {
  nosave = false;
  useHtml = false;
  backgroundColor: string | null = null;
  backgroundImage: string | null = null;
  color: string | null = null;
  linkColor: string | null = null;
  fontSize: number | null = null;
  fontName: string | null = null;

  isStatsPanelVisible = true;
  isObjectPanelVisible = true;
  isActionsPanelVisible = true;
  isUserInputPanelVisible = true;

  defaultBackgroundColor = '#e0e0e0';
  defaultColor = '#000000';
  defaultLinkColor = '#0000ff';
  defaultFontSize = 12;
  defaultFontName = '';

  constructor(private manager: GameManager, private resources: IResourceManager) {
    makeObservable(this, {
      nosave: observable,
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

  async initialized(manager: GameManager): Promise<void> {
    await manager.apiInitialized;
    this.initCallbacks(manager);
    // reaction(
    //   () => this.manager.currentGame,
    //   (descriptor) => {
    //     if (!descriptor) {
    //       this.fillClassicDefaults();
    //       return;
    //     }
    //     this.currentMode = descriptor.mode;
    //     if (descriptor.mode === 'aero') {
    //       this.fillAeroDefaults();
    //     } else {
    //       this.fillClassicDefaults();
    //       if (manager.gameConfig) {
    //         this.fillDefaultsFromConfig(manager.gameConfig);
    //       }
    //     }
    //   }
    // );
  }

  // fillDefaultsFromConfig(config: CfgData): void {
  //   if (config) {
  //     if (config.Colors) {
  //       this.defaultBackgroundColor = this.convertColor(config.Colors.BackColor, false);
  //       this.defaultColor = this.convertColor(config.Colors.FontColor, false);
  //       this.defaultLinkColor = this.convertColor(config.Colors.LinkColor, false);
  //     }
  //     if (config.Font) {
  //       this.defaultFontName = config.Font.FontName;
  //       this.defaultFontSize = config.Font.FontSize;
  //     }
  //   }
  // }

  fillDefaults(defaults: BaseLayoutDefaults): void {
    this.defaultFontName = defaults.defaultFontName;
    this.defaultFontSize = defaults.defaultFontSize;
    this.defaultBackgroundColor = defaults.defaultBackgroundColor;
    this.defaultColor = defaults.defaultColor;
    this.defaultLinkColor = defaults.defaultLinkColor;
  }

  initCallbacks(manager: GameManager): void {
    manager.on('panel_visibility', this.updatePanalVisibility);
    manager.on('layout', (settings) => this.updateLayoutSettings(settings, manager.currentGame.mode));
  }

  updateLayoutSettings = (settings: LayoutSettings, mode: string): void => {
    this.nosave = settings.nosave;
    this.useHtml = settings.useHtml || mode === 'aero';
    this.backgroundColor = settings.backgroundColor ? convertColor(settings.backgroundColor) : null;
    this.backgroundImage = settings.backgroundImage;
    this.color = settings.color ? convertColor(settings.color) : null;
    this.linkColor = settings.linkColor ? convertColor(settings.linkColor) : null;
    this.fontSize = settings.fontSize;
    this.fontName = settings.fontName;
  };

  updatePanalVisibility = (type: QspPanel, isShown: boolean): void => {
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

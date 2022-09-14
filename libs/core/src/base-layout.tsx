import { observable, action, computed, makeObservable, runInAction } from 'mobx';
import { convertColor } from '@qspider/utils';
import { BaseLayoutDefaults, IResourceManager, QspGUIPanel } from '@qspider/contracts';
import { Theme } from '@emotion/react';
import { GameManager } from './game-manager';
import { QspPanel } from '@qsp/wasm-engine';

export class BaseLayout {
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
      backgroundColor: observable,
      backgroundImage: observable,
      color: observable,
      linkColor: observable,
      fontSize: observable,
      fontName: observable,

      defaultBackgroundColor: observable,
      defaultColor: observable,
      defaultLinkColor: observable,
      defaultFontSize: observable,
      defaultFontName: observable,

      isStatsPanelVisible: observable,
      isObjectPanelVisible: observable,
      isActionsPanelVisible: observable,
      isUserInputPanelVisible: observable,

      theme: computed,

      updatePanalVisibility: action,
      fillDefaults: action,
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
    await manager.apiInitialized.promise;
    this.initCallbacks(manager);
  }

  fillDefaults(defaults: BaseLayoutDefaults): void {
    this.defaultFontName = defaults.defaultFontName;
    this.defaultFontSize = defaults.defaultFontSize;
    this.defaultBackgroundColor = defaults.defaultBackgroundColor;
    this.defaultColor = defaults.defaultColor;
    this.defaultLinkColor = defaults.defaultLinkColor;
  }

  initCallbacks(manager: GameManager): void {
    manager.on('panel_visibility', this.updatePanalVisibility);
    manager.api.watchVariable('BCOLOR', 0, (backgroundColor) => {
      runInAction(() => {
        this.backgroundColor = backgroundColor ? convertColor(backgroundColor) : null;
      });
    });
    manager.api.watchVariable('$BACKIMAGE', 0, (backgroundImage) => {
      runInAction(() => {
        this.backgroundImage = backgroundImage;
      });
    });
    manager.api.watchVariable('FCOLOR', 0, (color) => {
      runInAction(() => {
        this.color = convertColor(color);
      });
    });
    manager.api.watchVariable('LCOLOR', 0, (linkColor) => {
      runInAction(() => {
        this.linkColor = convertColor(linkColor);
      });
    });
    manager.api.watchVariable('FSIZE', 0, (fontSize) => {
      runInAction(() => {
        this.fontSize = fontSize;
      });
    });
    manager.api.watchVariable('$FNAME', 0, (fontName) => {
      runInAction(() => {
        this.fontName = fontName;
      });
    });
  }

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

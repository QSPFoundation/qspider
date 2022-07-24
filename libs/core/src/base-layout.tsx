import { observable, action, computed, makeObservable } from 'mobx';
import { convertColor } from '@qspider/utils';
import { BaseLayoutDefaults, IResourceManager, QspGUIPanel } from '@qspider/contracts';
import { QspPanel, LayoutSettings } from '@qspider/qsp-wasm';
import { Theme } from '@emotion/react';
import { GameManager } from './game-manager';

export class BaseLayout {
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

      updateLayoutSettings: action,
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
    manager.on('layout', (settings) => this.updateLayoutSettings(settings, manager.currentGame?.mode));
  }

  updateLayoutSettings = (settings: LayoutSettings, mode?: string): void => {
    this.nosave = settings.nosave;
    this.useHtml = settings.useHtml || mode === 'aero';
    this.backgroundColor = settings.backgroundColor ? convertColor(settings.backgroundColor) : null;
    this.backgroundImage = settings.backgroundImage;
    this.color = convertColor(settings.color);
    this.linkColor = convertColor(settings.linkColor);
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

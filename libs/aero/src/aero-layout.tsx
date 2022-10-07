import React, { useState } from 'react';
import { observable, makeObservable, reaction, IReactionDisposer, runInAction } from 'mobx';
import { IBaseLayout, IGameManager, IResourceManager } from '@qspider/contracts';
import { useBaseLayout, useGameManager, useResources } from '@qspider/providers';
import { useEffect } from 'react';
import { QspAPI, QspVaribleType } from '@qsp/wasm-engine';
import { convertColor } from '@qspider/utils';
import {
  AeroContentRectangle,
  AeroEffectType,
  AeroPanelUI,
  InputUI,
  ListPanelUI,
  MenuUI,
  MsgUI,
  PlayerUI,
  ScrollUI,
  ViewUI,
} from './aero.types';

const aeroDefaults = {
  defaultBackgroundColor: '#e5e5e5',
  defaultColor: '#000000',
  defaultLinkColor: '#0000ff',
  defaultFontSize: 16,
  defaultFontName: 'sans-serif',
};

export const TEXT_PLACEHOLDER = '%TEXT%';
export const IMAGE_PLACEHOLDER = '%IMAGE%';

export const LIST_UI = '<table><tr><td><img src="%IMAGE%"/></td><td style="width:100%;">%TEXT%</td></tr></table>';
export const SELECTED_LIST_UI =
  '<table><tr><td><img src="%IMAGE%"/></td><td style="width:100%;color:#0000FF;">%TEXT%</td></tr></table>';

class AeroLayout {
  scrollUI: ScrollUI = {
    upArrowImage: '',
    downArrowImage: '',
    hideArrows: false,
  };
  playerUI: PlayerUI = {
    styles: '',
    disableShade: false,
    disableScroll: false,
    disableAutoref: false,
    sequenceNewLocEffect: false,
    newLocEffect: {
      name: '',
      time: 500,
    },
    backImage: '',
    topImage: '',
    intergratedActions: false,
  };
  mainUI: AeroPanelUI = {
    x: 4,
    y: 4,
    width: 589,
    height: 389,
    format: TEXT_PLACEHOLDER,
    backImage: '',
  };
  statsUI: AeroPanelUI = {
    x: 596,
    y: 396,
    width: 200,
    height: 200,
    format: TEXT_PLACEHOLDER,
    backImage: '',
  };
  actionsUI: ListPanelUI = {
    x: 4,
    y: 396,
    width: 589,
    height: 169,
    format: LIST_UI,
    selectedFormat: SELECTED_LIST_UI,
    backImage: '',
  };
  objectsUI: ListPanelUI = {
    x: 596,
    y: 4,
    width: 200,
    height: 389,
    format: LIST_UI,
    selectedFormat: SELECTED_LIST_UI,
    backImage: '',
  };
  userInputUI: AeroContentRectangle = {
    x: 4,
    y: 568,
    width: 589,
    height: 28,
  };
  viewUI: ViewUI = {
    x: 250,
    y: 150,
    width: 300,
    height: 300,
    effect: { name: '', time: 500 },
    alwaysShow: false,
  };
  inputUI: InputUI = {
    backImage: '',
    x: 200,
    y: 165,
    format: TEXT_PLACEHOLDER,
    text: {
      x: 4,
      y: 4,
      width: 392,
      height: 231,
    },
    field: {
      x: 4,
      y: 238,
      width: 312,
      height: 28,
    },
    okButton: {
      x: 324,
      y: 239,
      image: '',
    },
    cancelButton: {
      x: 362,
      y: 239,
      image: '',
    },
    effect: { name: '', time: 500 },
  };
  msgUI: MsgUI = {
    backImage: '',
    x: 200,
    y: 165,
    format: TEXT_PLACEHOLDER,
    text: {
      x: 4,
      y: 4,
      width: 392,
      height: 231,
    },
    okButton: {
      x: 186,
      y: 239,
      image: '',
    },
    effect: { name: '', time: 500 },
  };
  menuUI: MenuUI = {
    fixedSize: false,
    padding: 4,
    borderWidth: 1,
    borderColor: 'RGB(64,64,64)',
    backImage: '',
    x: -1,
    y: -1,
    format: LIST_UI,
    selectedFormat: SELECTED_LIST_UI,
    list: {
      x: 4,
      y: 4,
      width: 153,
      height: 123,
    },
    effect: { name: '', time: 500 },
  };

  private api!: QspAPI;
  reactionDisposer!: IReactionDisposer;
  private disposers: Array<() => void> = [];

  constructor(private manager: IGameManager, private baseLayout: IBaseLayout, private resources: IResourceManager) {
    makeObservable(this, {
      scrollUI: observable,
      playerUI: observable,
      mainUI: observable,
      statsUI: observable,
      actionsUI: observable,
      objectsUI: observable,
      userInputUI: observable,
      viewUI: observable,
      inputUI: observable,
      msgUI: observable,
      menuUI: observable,
    });
    this.initialized(manager);
  }

  async initialized(manager: IGameManager): Promise<void> {
    await manager.apiInitialized.promise;
    this.api = manager.api;
    this.initWatchers();
    this.reactionDisposer = reaction(
      () => manager.currentGame,
      async (descriptor) => {
        if (!descriptor) return;
        if (descriptor.mode === 'aero') {
          this.baseLayout.fillDefaults(aeroDefaults);
          this.readConfig();
        }
      },
      {
        fireImmediately: true,
      }
    );
  }

  async readConfig(): Promise<void> {
    try {
      const content = await this.resources.getTextContent('config.xml');
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'application/xml');
      const gameElement = doc.querySelector('game');
      if (this.manager.currentGame && gameElement) {
        const width = parseInt(gameElement.getAttribute('width') || '800');
        const height = parseInt(gameElement.getAttribute('height') || '600');
        this.manager.currentGame.aero = {
          width,
          height,
        };
        this.manager.windowManager.resize(width, height + 20);
        const title = gameElement.getAttribute('title');
        if (title) {
          this.manager.currentGame.title = title;
          this.manager.windowManager.setTitle(title);
        }
      }
    } catch {
      // noop
    }
  }

  initWatchers(): void {
    this.watchLayoutVariable('$UP_ARROW_IMAGE', '', (upArrowImage) => {
      this.scrollUI.upArrowImage = upArrowImage;
    });
    this.watchLayoutVariable('$DOWN_ARROW_IMAGE', '', (downArrowImage) => {
      this.scrollUI.downArrowImage = downArrowImage;
    });
    this.watchLayoutVariable('HIDE_SCROLL_ARROWS', 0, (hideArrows) => {
      this.scrollUI.hideArrows = Boolean(hideArrows);
    });
    this.watchLayoutVariable('$STYLESHEET', '', (styles) => {
      this.playerUI.styles = styles;
    });
    this.watchLayoutVariable('DISABLESHADE', 0, (disableShade) => {
      this.playerUI.disableShade = Boolean(disableShade);
    });
    this.watchLayoutVariable('DISABLESCROLL', 0, (disableScroll) => {
      this.playerUI.disableScroll = Boolean(disableScroll);
    });
    this.watchLayoutVariable('DISABLEAUTOREF', 0, (disableAutoref) => {
      this.playerUI.disableAutoref = Boolean(disableAutoref);
    });
    this.watchLayoutVariable('$NEWLOC_EFFECT', '', (effectName) => {
      this.playerUI.newLocEffect.name = effectName as AeroEffectType;
    });
    this.watchLayoutVariable('NEWLOC_EFFECT_TIME', 500, (effectTime) => {
      this.playerUI.newLocEffect.time = effectTime;
    });
    this.watchLayoutVariable('NEWLOC_EFFECT_SEQ', 0, (sequenceNewLocEffect) => {
      this.playerUI.sequenceNewLocEffect = Boolean(sequenceNewLocEffect);
    });
    this.watchLayoutVariable('$BACKIMAGE', '', (backImage) => {
      this.playerUI.backImage = backImage;
    });
    this.watchLayoutVariable('$TOPIMAGE', '', (topImage) => {
      this.playerUI.topImage = topImage;
    });
    this.watchLayoutVariable('INTEGRATED_ACTIONS', 0, (intergratedActions) => {
      this.playerUI.intergratedActions = Boolean(intergratedActions);
    });
    this.watchLayoutVariable('MAINDESC_X', 4, (x) => {
      this.mainUI.x = x;
    });
    this.watchLayoutVariable('MAINDESC_Y', 4, (y) => {
      this.mainUI.y = y;
    });
    this.watchLayoutVariable('MAINDESC_W', 589, (width) => {
      this.mainUI.width = width;
    });
    this.watchLayoutVariable('MAINDESC_H', 389, (height) => {
      this.mainUI.height = height;
    });
    this.watchLayoutVariable('$MAIN_FORMAT', TEXT_PLACEHOLDER, (format) => {
      this.mainUI.format = format;
    });
    this.watchLayoutVariable('$MAINDESC_BACKIMAGE', '', (backImage) => {
      this.mainUI.backImage = backImage;
    });
    this.watchLayoutVariable('STATDESC_X', 596, (x) => {
      this.statsUI.x = x;
    });
    this.watchLayoutVariable('STATDESC_Y', 396, (y) => {
      this.statsUI.y = y;
    });
    this.watchLayoutVariable('STATDESC_W', 200, (width) => {
      this.statsUI.width = width;
    });
    this.watchLayoutVariable('STATDESC_H', 200, (height) => {
      this.statsUI.height = height;
    });
    this.watchLayoutVariable('$STAT_FORMAT', TEXT_PLACEHOLDER, (format) => {
      this.statsUI.format = format;
    });
    this.watchLayoutVariable('$STATDESC_BACKIMAGE', '', (backImage) => {
      this.statsUI.backImage = backImage;
    });
    this.watchLayoutVariable('ACTIONS_X', 4, (x) => {
      this.actionsUI.x = x;
    });
    this.watchLayoutVariable('ACTIONS_Y', 396, (y) => {
      this.actionsUI.y = y;
    });
    this.watchLayoutVariable('ACTIONS_W', 589, (width) => {
      this.actionsUI.width = width;
    });
    this.watchLayoutVariable('ACTIONS_H', 169, (height) => {
      this.actionsUI.height = height;
    });
    this.watchLayoutVariable('$ACTION_FORMAT', LIST_UI, (format) => {
      this.actionsUI.format = format;
    });
    this.watchLayoutVariable('$SEL_ACTION_FORMAT', SELECTED_LIST_UI, (selectedFormat) => {
      this.actionsUI.selectedFormat = selectedFormat;
    });
    this.watchLayoutVariable('$ACTIONS_BACKIMAGE', '', (backImage) => {
      this.actionsUI.backImage = backImage;
    });
    this.watchLayoutVariable('OBJECTS_X', 596, (x) => {
      this.objectsUI.x = x;
    });
    this.watchLayoutVariable('OBJECTS_Y', 4, (y) => {
      this.objectsUI.y = y;
    });
    this.watchLayoutVariable('OBJECTS_W', 200, (width) => {
      this.objectsUI.width = width;
    });
    this.watchLayoutVariable('OBJECTS_H', 389, (height) => {
      this.objectsUI.height = height;
    });
    this.watchLayoutVariable('$OBJECT_FORMAT', LIST_UI, (format) => {
      this.objectsUI.format = format;
    });
    this.watchLayoutVariable('$SEL_OBJECT_FORMAT', SELECTED_LIST_UI, (selectedFormat) => {
      this.objectsUI.selectedFormat = selectedFormat;
    });
    this.watchLayoutVariable('$OBJECTS_BACKIMAGE', '', (backImage) => {
      this.objectsUI.backImage = backImage;
    });
    this.watchLayoutVariable('USERINPUT_X', 4, (x) => {
      this.userInputUI.x = x;
    });
    this.watchLayoutVariable('USERINPUT_Y', 568, (y) => {
      this.userInputUI.y = y;
    });
    this.watchLayoutVariable('USERINPUT_W', 589, (width) => {
      this.userInputUI.width = width;
    });
    this.watchLayoutVariable('USERINPUT_H', 28, (height) => {
      this.userInputUI.height = height;
    });
    this.watchLayoutVariable('VIEW_X', 250, (x) => {
      this.viewUI.x = x;
    });
    this.watchLayoutVariable('VIEW_Y', 150, (y) => {
      this.viewUI.y = y;
    });
    this.watchLayoutVariable('VIEW_W', 300, (width) => {
      this.viewUI.width = width;
    });
    this.watchLayoutVariable('VIEW_H', 300, (height) => {
      this.viewUI.height = height;
    });
    this.watchLayoutVariable('$VIEW_EFFECT', '', (name) => {
      this.viewUI.effect.name = name as AeroEffectType;
    });
    this.watchLayoutVariable('VIEW_EFFECT_TIME', 500, (time) => {
      this.viewUI.effect.time = time;
    });
    this.watchLayoutVariable('ALWAYS_SHOW_VIEW', 0, (alwaysShow) => {
      this.viewUI.alwaysShow = Boolean(alwaysShow);
    });
    this.watchLayoutVariable('$INPUT_BACKIMAGE', '', (backImage) => {
      this.inputUI.backImage = backImage;
    });
    this.watchLayoutVariable('INPUT_X', 200, (x) => {
      this.inputUI.x = x;
    });
    this.watchLayoutVariable('INPUT_Y', 165, (y) => {
      this.inputUI.y = y;
    });
    this.watchLayoutVariable('$INPUT_FORMAT', TEXT_PLACEHOLDER, (format) => {
      this.inputUI.format = format;
    });
    this.watchLayoutVariable('INPUT_TEXT_X', 4, (x) => {
      this.inputUI.text.x = x;
    });
    this.watchLayoutVariable('INPUT_TEXT_Y', 4, (y) => {
      this.inputUI.text.y = y;
    });
    this.watchLayoutVariable('INPUT_TEXT_W', 392, (width) => {
      this.inputUI.text.width = width;
    });
    this.watchLayoutVariable('INPUT_TEXT_H', 231, (height) => {
      this.inputUI.text.height = height;
    });
    this.watchLayoutVariable('INPUT_BAR_X', 4, (x) => {
      this.inputUI.field.x = x;
    });
    this.watchLayoutVariable('INPUT_BAR_Y', 238, (y) => {
      this.inputUI.field.y = y;
    });
    this.watchLayoutVariable('INPUT_BAR_W', 312, (width) => {
      this.inputUI.field.width = width;
    });
    this.watchLayoutVariable('INPUT_BAR_H', 28, (height) => {
      this.inputUI.field.height = height;
    });
    this.watchLayoutVariable('INPUT_OK_X', 324, (x) => {
      this.inputUI.okButton.x = x;
    });
    this.watchLayoutVariable('INPUT_OK_Y', 239, (y) => {
      this.inputUI.okButton.y = y;
    });
    this.watchLayoutVariable('$INPUT_OK_IMAGE', '', (image) => {
      this.inputUI.okButton.image = image;
    });
    this.watchLayoutVariable('INPUT_CANCEL_X', 362, (x) => {
      this.inputUI.cancelButton.x = x;
    });
    this.watchLayoutVariable('INPUT_CANCEL_Y', 239, (y) => {
      this.inputUI.cancelButton.y = y;
    });
    this.watchLayoutVariable('$INPUT_CANCEL_IMAGE', '', (image) => {
      this.inputUI.cancelButton.image = image;
    });
    this.watchLayoutVariable('$INPUT_EFFECT', '', (effect) => {
      this.inputUI.effect.name = effect as AeroEffectType;
    });
    this.watchLayoutVariable('INPUT_EFFECT_TIME', 500, (time) => {
      this.inputUI.effect.time = time;
    });
    this.watchLayoutVariable('$MSG_BACKIMAGE', '', (backImage) => {
      this.msgUI.backImage = backImage;
    });
    this.watchLayoutVariable('MSG_X', 200, (x) => {
      this.msgUI.x = x;
    });
    this.watchLayoutVariable('MSG_Y', 165, (y) => {
      this.msgUI.y = y;
    });
    this.watchLayoutVariable('$MSG_FORMAT', TEXT_PLACEHOLDER, (format) => {
      this.msgUI.format = format;
    });
    this.watchLayoutVariable('MSG_TEXT_X', 4, (x) => {
      this.msgUI.text.x = x;
    });
    this.watchLayoutVariable('MSG_TEXT_Y', 4, (y) => {
      this.msgUI.text.y = y;
    });
    this.watchLayoutVariable('MSG_TEXT_W', 392, (width) => {
      this.msgUI.text.width = width;
    });
    this.watchLayoutVariable('MSG_TEXT_H', 231, (height) => {
      this.msgUI.text.height = height;
    });

    this.watchLayoutVariable('MSG_OK_X', 186, (x) => {
      this.msgUI.okButton.x = x;
    });
    this.watchLayoutVariable('MSG_OK_Y', 239, (y) => {
      this.msgUI.okButton.y = y;
    });
    this.watchLayoutVariable('$MSG_OK_IMAGE', '', (image) => {
      this.msgUI.okButton.image = image;
    });
    this.watchLayoutVariable('$MSG_EFFECT', '', (effect) => {
      this.msgUI.effect.name = effect as AeroEffectType;
    });
    this.watchLayoutVariable('MSG_EFFECT_TIME', 500, (time) => {
      this.msgUI.effect.time = time;
    });
    this.watchLayoutVariable('FIXED_SIZE_MENU', 0, (fixedSize) => {
      this.menuUI.fixedSize = Boolean(fixedSize);
    });
    this.watchLayoutVariable('MENU_PADDING', 4, (padding) => {
      this.menuUI.padding = padding;
    });
    this.watchLayoutVariable('MENU_BORDER', 1, (borderWidth) => {
      this.menuUI.borderWidth = borderWidth;
    });
    this.watchLayoutVariable('MENU_BORDER_COLOR', 0, (borderColor) => {
      this.menuUI.borderColor = convertColor(borderColor) || 'rgba(64,64,64,150)';
    });
    this.watchLayoutVariable('$MENU_BACKIMAGE', '', (backImage) => {
      this.menuUI.backImage = backImage;
    });
    this.watchLayoutVariable('MENU_X', -1, (x) => {
      this.menuUI.x = x;
    });
    this.watchLayoutVariable('MENU_Y', -1, (y) => {
      this.menuUI.y = y;
    });
    this.watchLayoutVariable('$MENU_FORMAT', LIST_UI, (format) => {
      this.menuUI.format = format;
    });
    this.watchLayoutVariable('$SEL_MENU_FORMAT', SELECTED_LIST_UI, (selectedFormat) => {
      this.menuUI.selectedFormat = selectedFormat;
    });
    this.watchLayoutVariable('MENU_LIST_X', 4, (x) => {
      this.menuUI.list.x = x;
    });
    this.watchLayoutVariable('MENU_LIST_Y', 4, (y) => {
      this.menuUI.list.y = y;
    });
    this.watchLayoutVariable('MENU_LIST_W', 153, (width) => {
      this.menuUI.list.width = width;
    });
    this.watchLayoutVariable('MENU_LIST_H', 123, (height) => {
      this.menuUI.list.height = height;
    });
    this.watchLayoutVariable('$MENU_EFFECT', '', (effect) => {
      this.menuUI.effect.name = effect as AeroEffectType;
    });
    this.watchLayoutVariable('MENU_EFFECT_TIME', 500, (time) => {
      this.menuUI.effect.time = time;
    });
  }

  watchLayoutVariable<Name extends string, T = QspVaribleType<Name>>(
    name: string,
    defaultValue: T,
    updater: (value: T) => void
  ): void {
    this.disposers.push(
      this.api.watchVariable(name, 0, (value) => {
        runInAction(() => updater((value as unknown as T) || defaultValue));
      })
    );
  }

  dispose(): void {
    this.reactionDisposer();
    for (const dispose of this.disposers) {
      dispose();
    }
  }
}

const layoutContext = React.createContext<AeroLayout | null>(null);

export const AeroLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const manager = useGameManager();
  const resources = useResources();
  const baseLayout = useBaseLayout();
  const [layout, setLayout] = useState<AeroLayout>();
  useEffect(() => {
    setLayout(new AeroLayout(manager, baseLayout, resources));
    return (): void => {
      layout?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return layout ? <layoutContext.Provider value={layout}>{children}</layoutContext.Provider> : null;
};

export const useAeroLayout = (): AeroLayout => {
  const layout = React.useContext(layoutContext);
  if (!layout) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useLayout must be used within a StoreProvider.');
  }
  return layout;
};

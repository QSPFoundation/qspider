import React, { useRef, useState } from 'react';
import { observable, action, makeObservable, reaction, IReactionDisposer } from 'mobx';
import {
  AeroApi,
  ScrollUI,
  PlayerUI,
  AeroPanelUI,
  ListPanelUI,
  ViewUI,
  InputUI,
  MsgUI,
  MenuUI,
  LIST_UI,
  SELECTED_LIST_UI,
  TEXT_PLACEHOLDER,
  AeroContentRectangle,
} from '@qspider/qsp-wasm';
import { IBaseLayout, IGameManager, IResourceManager } from '@qspider/contracts';
import { useBaseLayout, useGameManager, useResources } from '@qspider/providers';
import { useEffect } from 'react';

const aeroDefaults = {
  defaultBackgroundColor: '#e5e5e5',
  defaultColor: '#000000',
  defaultLinkColor: '#0000ff',
  defaultFontSize: 18,
  defaultFontName: 'sans-serif',
};

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

  private api!: AeroApi;
  reactionDisposer!: IReactionDisposer;

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

      updateScrollUI: action,
      updatePlayerUI: action,
      updateMainUI: action,
      updateStatsUI: action,
      updateActionsUI: action,
      updateObjectsUI: action,
      updateUserInputUI: action,
      updateViewUI: action,
      updateInputUI: action,
      updateMsgUI: action,
      updateMenuUI: action,
    });
    this.initialized(manager);
  }

  async initialized(manager: IGameManager): Promise<void> {
    await manager.apiInitialized.promise;
    this.api = new AeroApi(manager.api);
    this.initCallbacks();
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

  initCallbacks(): void {
    this.api.on('scroll_ui', this.updateScrollUI);
    this.api.on('player_ui', this.updatePlayerUI);
    this.api.on('main_ui', this.updateMainUI);
    this.api.on('stats_ui', this.updateStatsUI);
    this.api.on('actions_ui', this.updateActionsUI);
    this.api.on('objects_ui', this.updateObjectsUI);
    this.api.on('user_input_ui', this.updateUserInputUI);
    this.api.on('view_ui', this.updateViewUI);
    this.api.on('input_ui', this.updateInputUI);
    this.api.on('msg_ui', this.updateMsgUI);
    this.api.on('menu_ui', this.updateMenuUI);
  }

  updateScrollUI = (ui: ScrollUI): void => {
    this.scrollUI = ui;
  };
  updatePlayerUI = (ui: PlayerUI): void => {
    this.playerUI = ui;
  };
  updateMainUI = (ui: AeroPanelUI): void => {
    this.mainUI = ui;
  };
  updateStatsUI = (ui: AeroPanelUI): void => {
    this.statsUI = ui;
  };
  updateActionsUI = (ui: ListPanelUI): void => {
    this.actionsUI = ui;
  };
  updateObjectsUI = (ui: ListPanelUI): void => {
    this.objectsUI = ui;
  };
  updateUserInputUI = (ui: AeroPanelUI): void => {
    this.userInputUI = ui;
  };
  updateViewUI = (ui: ViewUI): void => {
    this.viewUI = ui;
  };
  updateInputUI = (ui: InputUI): void => {
    this.inputUI = ui;
  };
  updateMsgUI = (ui: MsgUI): void => {
    this.msgUI = ui;
  };
  updateMenuUI = (ui: MenuUI): void => {
    this.menuUI = ui;
  };

  dispose(): void {
    this.reactionDisposer();
  }
}

const layoutContext = React.createContext<AeroLayout | null>(null);

export const AeroLayoutProvider: React.FC = ({ children }) => {
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

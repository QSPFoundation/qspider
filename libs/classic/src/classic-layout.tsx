import React, { useState } from 'react';
import { observable, action, computed, makeObservable, reaction, IReactionDisposer } from 'mobx';
import { extractLayoutData, LayoutDock, LayoutPanel } from './cfg-converter';
import { CfgData, parseCfg } from './cfg-parser';
import { DEFAULT_FLOATING, DEFAULT_LAYOUT } from './defaults';
import { IBaseLayout, IGameManager, IResourceManager, QspGUIPanel } from '@qspider/contracts';
import { useBaseLayout, useGameManager, useResources } from '@qspider/providers';
import { convertColor } from '@qspider/utils';
import { useEffect } from 'react';

const classicDefaults = {
  defaultBackgroundColor: '#e0e0e0',
  defaultColor: '#000000',
  defaultLinkColor: '#0000ff',
  defaultFontSize: 16,
  defaultFontName: '',
};

class ClassicLayout {
  gameConfig: CfgData | false = false;
  layout: LayoutDock[] = [];
  floating: [QspGUIPanel, number, number][] = [];
  reactionDisposer!: IReactionDisposer;

  constructor(private manager: IGameManager, private baseLayout: IBaseLayout, private resources: IResourceManager) {
    makeObservable(this, {
      gameConfig: observable,
      layout: observable,
      floating: observable,

      visibleLayout: computed,
      floatingPanels: computed,

      updateLayout: action,
    });
    this.initialized(manager);
  }

  async initialized(manager: IGameManager): Promise<void> {
    await manager.apiInitialized.promise;
    this.reactionDisposer = reaction(
      () => this.manager.currentGame,
      async (descriptor) => {
        if (!descriptor) return;
        try {
          const text = await this.resources.getTextContent('qspgui.cfg');
          this.gameConfig = parseCfg(text);
        } catch (_) {
          this.gameConfig = false;
        }
        if (this.gameConfig) {
          const { layout, floating } = extractLayoutData(this.gameConfig);
          this.fillDefaultsFromConfig(this.gameConfig);
          this.updateLayout(layout, floating);
        } else {
          this.fillClassicDefaults();
          this.updateLayout(DEFAULT_LAYOUT, DEFAULT_FLOATING);
        }
      },
      {
        fireImmediately: true,
      }
    );
  }

  updateLayout(layout: LayoutDock[], floating: [QspGUIPanel, number, number][]): void {
    this.layout = layout;
    this.floating = floating;
  }

  fillDefaultsFromConfig(config: CfgData): void {
    const defaults = { ...classicDefaults };
    if (config) {
      if (config.Colors) {
        defaults.defaultBackgroundColor =
          convertColor(config.Colors.BackColor, false) || classicDefaults.defaultBackgroundColor;
        defaults.defaultColor = convertColor(config.Colors.FontColor, false) || classicDefaults.defaultColor;
        defaults.defaultLinkColor = convertColor(config.Colors.LinkColor, false) || classicDefaults.defaultLinkColor;
      }
      if (config.Font) {
        defaults.defaultFontName = config.Font.FontName;
        defaults.defaultFontSize = config.Font.FontSize;
      }
    }
    this.baseLayout.fillDefaults(defaults);
  }

  fillClassicDefaults(): void {
    this.baseLayout.fillDefaults(classicDefaults);
  }

  get visibleLayout(): LayoutDock[] {
    return this.layout.map(this.processDock).filter((d): d is LayoutDock => Boolean(d));
  }

  get floatingPanels(): [string, number, number][] {
    return this.floating.filter(([name]) => this.baseLayout.isPanelVisible(name));
  }

  processDock = (dock: LayoutDock): LayoutDock | null => {
    if ((dock[0] as QspGUIPanel) === QspGUIPanel.Main) {
      return dock;
    }
    if (dock[0] === 'center') {
      return [
        dock[0],
        dock[1],
        (dock[2] as LayoutDock[]).map(this.processDock).filter((d): d is LayoutDock => Boolean(d)),
      ];
    }
    const filteredChildren = this.filterPanels(dock[2] as LayoutPanel[]);
    if (filteredChildren && filteredChildren.length > 0) {
      return [dock[0], dock[1], filteredChildren];
    }
    return null;
  };

  filterPanels = (panels: LayoutPanel[]): LayoutPanel[] => {
    return panels && panels.filter(([name]) => this.baseLayout.isPanelVisible(name));
  };

  dispose(): void {
    this.reactionDisposer();
  }
}

const classicLayoutContext = React.createContext<ClassicLayout | null>(null);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const manager = useGameManager();
  const resources = useResources();
  const baseLayout = useBaseLayout();
  const [layout, setLayout] = useState<ClassicLayout>();
  useEffect(() => {
    setLayout(new ClassicLayout(manager, baseLayout, resources));
    return (): void => {
      layout?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return layout ? <classicLayoutContext.Provider value={layout}>{children}</classicLayoutContext.Provider> : null;
};

export const useClassicLayout = (): ClassicLayout => {
  const layout = React.useContext(classicLayoutContext);
  if (!layout) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useLayout must be used within a StoreProvider.');
  }
  return layout;
};

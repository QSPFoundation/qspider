import {
  DockPlace,
  isActsVisible$,
  isCmdVisible$,
  isObjsVisible$,
  isStatsVisible$,
  qspGuiCfg$,
  view$,
} from '@qspider/game-state';
import { useAtom, useSetup } from '@xoid/react';
import React, { isValidElement } from 'react';
import { Atom, atom } from 'xoid';
import { qspGuiLayout$ } from '../../render-state';
import { Markup } from '@qspider/html-renderer';
import {
  classicDefaultRules,
  isDockVisible,
  isLayerDockVisible,
  isPaneVisible,
  layerGridStyle,
} from './classic-layout-style';

interface DockData {
  visibility: string | null;
  size: number;
}

export const QspCL: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const layoutOverride = useAtom(qspGuiLayout$);
  if (layoutOverride) {
    return (
      <qsp-cl>
        <Markup content={layoutOverride} />
      </qsp-cl>
    );
  }
  return <qsp-cl>{children}</qsp-cl>;
};

export const QspCLLayer: React.FC<{ children: React.ReactNode }> = (props) => {
  const style$ = useSetup(($props) => {
    const children$ = $props?.focus((p) => p.children);
    const docks$ = atom((get) => {
      const docks: Record<string, DockData> = {};
      React.Children.forEach(get(children$), (child) => {
        if (isValidElement<React.ComponentProps<typeof QspCLDock>>(child) && child.type === QspCLDock) {
          docks[child.props.place] = {
            visibility: child.props.visibility,
            size: child.props.size,
          };
        }
      });
      return docks;
    });
    const visibleDocks$ = atom((get) => {
      const docks = get(docks$);
      const visibleDocks: Record<string, DockData> = {};
      for (const [place, data] of Object.entries(docks)) {
        const isVisible = isLayerDockVisible(data.visibility, (type) => {
          const atom = penelAtoms[type];
          return atom ? get(atom) : false;
        });
        if (isVisible) visibleDocks[place] = data;
      }
      return visibleDocks;
    });
    return atom<React.CSSProperties>((get) => layerGridStyle(get(visibleDocks$)));
  }, props);
  const style = useAtom(style$);
  return <qsp-cl-layer style={style}>{props.children}</qsp-cl-layer>;
};

const penelAtoms: Record<string, Atom<boolean>> = {
  input: isCmdVisible$,
  imgview: view$.focus((s) => s.isOpen),
  objs: isObjsVisible$,
  acts: isActsVisible$,
  vars: isStatsVisible$,
};

export const QspCLDock: React.FC<
  DockData & {
    place: DockPlace;
    children: React.ReactNode;
  }
> = (props) => {
  const visibility$ = useSetup((props$) => {
    return atom((get) => {
      const visibility$ = props$.focus((s) => s.visibility);
      return isDockVisible(get(visibility$), (panel) => {
        const atom = penelAtoms[panel];
        return atom ? get(atom) : false;
      });
    });
  }, props);
  const visibility = useAtom(visibility$);
  if (!visibility) return null;
  return (
    <qsp-cl-dock data-place={props.place} data-qsp-dock={props.place}>
      {props.children}
    </qsp-cl-dock>
  );
};

export const QspCLPane: React.FC<{ proportion: number; children: React.ReactNode; visibility: string | null }> = (
  props,
) => {
  const visibility$ = useSetup((props$) => {
    return atom((get) => {
      const visibility$ = props$.focus((s) => s.visibility);
      return isPaneVisible(get(visibility$), (panel) => {
        const atom = penelAtoms[panel];
        return atom ? get(atom) : false;
      });
    });
  }, props);
  const visibility = useAtom(visibility$);
  if (!visibility) return null;
  return <qsp-cl-pane style={{ flexGrow: props.proportion }}>{props.children}</qsp-cl-pane>;
};

export const QspCLDefaults: React.FC = () => {
  const config = useAtom(qspGuiCfg$);
  if (!config) return null;
  const rules = classicDefaultRules(config);
  const style = `qsp-game-root, #portal-container {${rules.join(';')}}`;
  return <style>{style}</style>;
};

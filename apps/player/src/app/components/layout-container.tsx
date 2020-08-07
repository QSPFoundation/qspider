import React, { ReactElement } from 'react';
import { ViewPort, Fill } from 'react-spaces';
import { LayoutDock, LayoutPanel, isHorizontal, isCenter } from '../game/cfg-converter';
import { Row } from './layout/row';
import { Column } from './layout/column';
import { MainPanel } from './panels/main/main';
import { ObjectsPanel } from './panels/objects/objects';
import { StatsPanel } from './panels/stats/stats';
import { ActionsPanel } from './panels/actions/actions';
import { UserInputPanel } from './panels/user-input/user-input';
import { PanelWrapper } from './layout/panel-wrapper';
import { RightDock, BottomDock, LeftDock, TopDock } from './layout/docks';
import { ViewImagePanel } from './panels/view-image/view-image.panel';
import { observer } from 'mobx-react-lite';
import { QspGUIPanel } from '../constants';
import { useLayout } from '../game/layout';

const docksMap = {
  top: TopDock,
  right: RightDock,
  bottom: BottomDock,
  left: LeftDock,
};

const pannelsMap: Record<QspGUIPanel, React.FC> = {
  [QspGUIPanel.Main]: MainPanel,
  [QspGUIPanel.Objects]: ObjectsPanel,
  [QspGUIPanel.Stats]: StatsPanel,
  [QspGUIPanel.Actions]: ActionsPanel,
  [QspGUIPanel.Input]: UserInputPanel,
  [QspGUIPanel.ImageView]: ViewImagePanel,
};

function renderPanel([name, size]: LayoutPanel): ReactElement {
  const Panel = pannelsMap[name];
  return (
    <PanelWrapper key={name} size={size}>
      <Panel />
    </PanelWrapper>
  );
}

function renderCenter(panels: LayoutPanel[] | LayoutDock[]): ReactElement {
  if (panels[0][0] === QspGUIPanel.Main) {
    return (
      <Fill key="center" scrollable>
        <MainPanel />
      </Fill>
    );
  }
  return <Fill key="center">{renderLayoutGroup(panels as LayoutDock[])}</Fill>;
}

function renderDock([dock, size, panels]: LayoutDock): ReactElement {
  const Component = docksMap[dock];
  if (dock === 'center') {
    return renderCenter(panels);
  }
  const ContentWrapper = isHorizontal(dock) ? Row : Column;
  return (
    <Component key={dock} size={size > 0 ? `${size}%` : '100%'}>
      <ContentWrapper>{(panels as LayoutPanel[]).map(renderPanel)}</ContentWrapper>
    </Component>
  );
}

function renderLayoutGroup(group: LayoutDock[]): ReactElement[] {
  const horizontal: LayoutDock[] = [];
  const vertical: LayoutDock[] = [];
  let center: LayoutDock;
  for (const dock of group) {
    if (isCenter(dock[0])) {
      center = dock;
    } else if (isHorizontal(dock[0])) {
      horizontal.push(dock);
    } else {
      vertical.push(dock);
    }
  }
  const centerElement = renderDock(center);
  const horizontalElements = horizontal.map(renderDock);
  const verticalElements = vertical.map(renderDock);
  if (horizontalElements.length && verticalElements.length) {
    return [
      ...horizontalElements,
      <Fill key="wrapper">
        {centerElement}
        {verticalElements}
      </Fill>,
    ];
  }
  return [...vertical.map(renderDock), ...horizontal.map(renderDock), renderDock(center)];
}

export const LayoutContainer: React.FC = observer(() => {
  const { visibleLayout } = useLayout();
  return <ViewPort>{renderLayoutGroup(visibleLayout)}</ViewPort>;
});

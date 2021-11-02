import React, { ReactElement } from 'react';
import { ViewPort, Fill, Top } from 'react-spaces';
import { Row } from './layout/row';
import { Column } from './layout/column';
import { PanelWrapper } from './layout/panel-wrapper';
import { RightDock, BottomDock, LeftDock, TopDock } from './layout/docks';
import { QspGUIPanel } from '@qspider/contracts';
import { MainPanel } from './panels/main';
import { ObjectsPanel } from './panels/objects';
import { StatsPanel } from './panels/stats';
import { ActionsPanel } from './panels/actions';
import { UserInputPanel } from './panels/user-input';
import { ViewImagePanel } from './panels/view-image';
import { isCenter, isHorizontal, LayoutDock, LayoutPanel } from './cfg-converter';
import { observer } from 'mobx-react-lite';
import { PlayerToolbar } from '@qspider/player-ui';
import { useClassicLayout } from './classic-layout';

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
  if (panels[0][0] === QspGUIPanel.Main || (panels[0][0] === 'center' && panels[0][2] && panels[0][2].length === 1)) {
    return (
      <Fill key="main">
        <MainPanel />
      </Fill>
    );
  }
  return <Fill key="center">{renderLayoutGroup(panels as LayoutDock[])}</Fill>;
}

function renderDock([dock, size, panels]: LayoutDock): ReactElement {
  const Component = docksMap[dock as keyof typeof docksMap];
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
  let center!: LayoutDock;
  for (const dock of group) {
    if (isCenter(dock[0])) {
      center = dock;
    } else if (isHorizontal(dock[0])) {
      horizontal.push(dock);
    } else {
      vertical.push(dock);
    }
  }
  const centerElement = center ? renderDock(center) : null;
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
  return [...vertical.map(renderDock), ...horizontal.map(renderDock), center ? renderDock(center) : null].filter(
    (el): el is ReactElement => Boolean(el)
  );
}

export const LayoutContainer: React.FC = observer(() => {
  const { visibleLayout } = useClassicLayout();
  return (
    <ViewPort>
      <Top size={40}>
        <PlayerToolbar />
      </Top>
      <Fill>{renderLayoutGroup(visibleLayout)}</Fill>
    </ViewPort>
  );
});

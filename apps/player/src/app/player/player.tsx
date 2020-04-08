import React from 'react';
import { Pane } from 'evergreen-ui';

import { MainPanel } from '../components/main/main.panel';
import { ActionsPanel } from '../components/actions/actions.panel';
import { ObjectsPanel } from '../components/objects/objects.panel';
import { StatsPanel } from '../components/stats/stats.panel';
import { UserInputPanel } from '../components/user-input/user-input.panel';
import { ErrorDialog } from '../components/dialogs/error/error.dialog';
import { observer } from 'mobx-react-lite';
import { useLayout } from '../game/layout';
import { Menu } from '../components/menu/menu';
import { MsgDialog } from '../components/dialogs/msg/msg.dialog';
import { InputDialog } from '../components/dialogs/input/input.dialog';
import { WaitLock } from '../components/wait-lock';
import { ViewImagePanel } from '../components/view-image/view-image.panel';

export const Player: React.FC = observer(() => {
  const {
    templateAreas,
    backgroundColor: background,
    color,
    fontSize,
    fontName,
  } = useLayout();
  return (
    <>
      <Pane
        width="100vw"
        height="100vh"
        display="grid"
        gridGap="8px"
        gridTemplateRows="1fr 300px 50px"
        gridTemplateColumns="1fr 150px 300px"
        gridTemplateAreas={templateAreas}
        background={background}
        color={color}
        fontSize={fontSize || 16}
        fontFamily={fontName}
      >
        <MainPanel />
        <ActionsPanel />
        <ObjectsPanel />
        <StatsPanel />
        <UserInputPanel />
      </Pane>
      <ErrorDialog />
      <MsgDialog />
      <InputDialog />
      <Menu />
      <ViewImagePanel />
      <WaitLock />
    </>
  );
});

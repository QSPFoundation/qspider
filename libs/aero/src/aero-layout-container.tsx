import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { AeroStylesheet } from './aero-stylesheet';
import { AeroInputDialog } from './dialogs/aero-input.dialog';
import { AeroMsgDialog } from './dialogs/aero-msg.dialog';
import { AeroActionsPanel } from './panels/aero-actions';
import { AeroMainPanel } from './panels/aero-main';
import { AeroMenu } from './panels/aero-menu';
import { AeroObjectsPanel } from './panels/aero-objects';
import { AeroStatsPanel } from './panels/aero-stat';
import { AeroUserInputPanel } from './panels/aero-user-input';
import { AeroViewImagePanel } from './panels/aero-view-image';
import { SaveSlotsDialog, ErrorDialog } from '@qspider/player-ui';

import defaultBackground from '../assets/back.png';
import defaultUpArrow from '../assets/up_arrow.png';
import defaultDownArrow from '../assets/down_arrow.png';
import { useGameManager, useResources } from '@qspider/providers';
import { useAeroLayout } from './aero-layout';
import { hooks } from '@qspider/components';

const AeroPlayerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AeroPlayerBlock = styled.div<{
  width: number;
  height: number;
  backgroundImage?: string;
}>`
  position: relative;
  width: ${(props): number => props.width}px;
  height: ${(props): number => props.height}px;
  background-image: ${({ backgroundImage }): string => (backgroundImage ? `url("${backgroundImage}")` : 'none')};
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
  text-align: left;
  overflow: hidden;
  tab-size: 4;
`;

const AeroPlayerForeground = styled.div<{
  image: string;
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url('${({ image }): string => image}');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
  pointer-events: none;
`;

export const AeroLayoutContainer: React.FC = observer(({ children }) => {
  const manager = useGameManager();
  const layout = useAeroLayout();
  const resources = useResources();

  const upArrow = layout.scrollUI.upArrowImage ? resources.get(layout.scrollUI.upArrowImage).url : defaultUpArrow;
  const { width: upArrowWidth, height: upArrowHeight } = hooks.useImageSize(upArrow);
  const downArrow = layout.scrollUI.downArrowImage
    ? resources.get(layout.scrollUI.downArrowImage).url
    : defaultDownArrow;
  const { width: downArrowWidth, height: downArrowHeight } = hooks.useImageSize(downArrow);

  const style = {
    '--up-arrow': layout.scrollUI.hideArrows ? '' : `url("${upArrow}")`,
    '--up-arrow-width': upArrowWidth + 'px',
    '--up-arrow-height': upArrowHeight + 'px',
    '--down-arrow': layout.scrollUI.hideArrows ? '' : `url("${downArrow}")`,
    '--down-arrow-width': downArrowWidth + 'px',
    '--down-arrow-height': downArrowHeight + 'px',
  } as React.CSSProperties;

  return (
    <AeroPlayerWrapper>
      <AeroPlayerBlock
        width={manager.currentGame?.aero?.width || 800}
        height={manager.currentGame?.aero?.height || 600}
        backgroundImage={layout.playerUI?.backImage ? resources.get(layout.playerUI?.backImage).url : defaultBackground}
        style={style}
      >
        <AeroStylesheet />
        <AeroStatsPanel />
        <AeroMainPanel />
        <AeroObjectsPanel />
        {layout.playerUI?.intergratedActions ? null : <AeroActionsPanel />}
        <AeroUserInputPanel />
        <AeroViewImagePanel />
        {layout.playerUI?.topImage ? (
          <AeroPlayerForeground image={resources.get(layout.playerUI?.topImage).url} />
        ) : null}
        <AeroMenu />
        <AeroMsgDialog />
        <AeroInputDialog />
        <ErrorDialog />
        <SaveSlotsDialog />
      </AeroPlayerBlock>
    </AeroPlayerWrapper>
  );
});

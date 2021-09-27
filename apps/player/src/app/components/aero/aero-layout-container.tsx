import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useAeroLayout } from '../../game/aero/aero-layout';
import { useGameManager } from '../../game/manager';
import { useResources } from '../../game/resource-manager';
import { ErrorDialog } from '../dialogs/error/error.dialog';
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

import defaultBackground from '../../../assets/aero/back.png';
import { SaveSlotsDialog } from '../dialogs/save-slots/save-slots';
import { useImageSize } from '../../hooks/image-size';

import defaultUpArrow from '../../../assets/aero/up_arrow.png';
import defaultDownArrow from '../../../assets/aero/down_arrow.png';

const AeroPlayerBlock = styled.div<{
  width: number;
  height: number;
  backgroundImage?: string;
}>`
  position: relative;
  margin: 0 auto;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: ${({ backgroundImage }) => (backgroundImage ? `url("${backgroundImage}")` : 'none')};
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
  text-align: left;
`;

const AeroPlayerForeground = styled.div<{
  image: string;
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url('${({ image }) => image}');
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
  const { width: upArrowWidth, height: upArrowHeight } = useImageSize(upArrow);
  const downArrow = layout.scrollUI.downArrowImage
    ? resources.get(layout.scrollUI.downArrowImage).url
    : defaultDownArrow;
  const { width: downArrowWidth, height: downArrowHeight } = useImageSize(downArrow);

  const style = {
    '--up-arrow': layout.scrollUI.hideArrows ? '' : `url("${upArrow}")`,
    '--up-arrow-width': upArrowWidth + 'px',
    '--up-arrow-height': upArrowHeight + 'px',
    '--down-arrow': layout.scrollUI.hideArrows ? '' : `url("${downArrow}")`,
    '--down-arrow-width': downArrowWidth + 'px',
    '--down-arrow-height': downArrowHeight + 'px',
  } as React.CSSProperties;

  return (
    <AeroPlayerBlock
      width={manager.currentGame.aero?.width || 800}
      height={manager.currentGame.aero?.height || 600}
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
      {layout.playerUI?.topImage ? <AeroPlayerForeground image={resources.get(layout.playerUI?.topImage).url} /> : null}
      <AeroMenu />
      <AeroMsgDialog />
      <AeroInputDialog />
      <ErrorDialog />
      <SaveSlotsDialog />
    </AeroPlayerBlock>
  );
});

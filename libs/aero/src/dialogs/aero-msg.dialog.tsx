import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { AeroEffect } from '../effects/aero-effect';
import { AeroCustomScroll } from '../aero-custom-scroll';

import defaultMsgBack from '../assets/msg_back.png';
import defaultMsgOkButton from '../assets/msg_ok.png';
import { AeroOverlay } from '../aero-overlay';
import { useGameManager, useResources } from '@qspider/providers';
import { TEXT_PLACEHOLDER, useAeroLayout } from '../aero-layout';
import { Content, hooks } from '@qspider/components';
import { MsgUI } from '../aero.types';

const MsgContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
`;

const MsgBody = styled.div<{ width: number; height: number; x: number; y: number; backgroundImage?: string }>`
  background-image: ${(props): string => `url(${props.backgroundImage})`};
  background-color: var(--background-color);
  width: ${(props): number => props.width || 320}px;
  height: ${(props): number => props.height || 320}px;
  left: ${(props): number => props.x}px;
  top: ${(props): number => props.y}px;
  pointer-events: auto;
  position: relative;
  display: flex;
`;

const MsgTextContainer = styled.div<{ ui: MsgUI }>`
  position: absolute;
  width: ${(props): number => props.ui.text.width}px;
  height: ${(props): number => props.ui.text.height}px;
  top: ${(props): number => props.ui.text.y}px;
  left: ${(props): number => props.ui.text.x}px;
  white-space: pre-wrap;
`;

const MsgButton = styled.button<{ x?: number; y?: number; backgroundImage: string; width: number; height: number }>`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  position: absolute;
  border: none;
  left: ${(props): number => props.x || 0}px;
  top: ${(props): number => props.y || 0}px;
  width: ${(props): string => props.width + 'px' || 'auto'};
  height: ${(props): string => props.height + 'px' || 'auto'};
  box-sizing: border-box;
  background-color: transparent;
  background-image: ${(props): string => `url("${props.backgroundImage}")`};
  padding: 0;

  &:focus {
    outline: none;
  }
`;

export const AeroMsgDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const layout = useAeroLayout();
  const resources = useResources();

  const onClose = useCallback(() => {
    manager.closeMsg();
  }, [manager]);

  const coordinates = hooks.useClickCoordinates();
  const x = layout.msgUI && layout.msgUI.x >= 0 ? layout.msgUI.x : coordinates.x;
  const y = layout.msgUI && layout.msgUI.y >= 0 ? layout.msgUI.y : coordinates.y;

  const url = layout.msgUI.backImage ? resources.get(layout.msgUI.backImage).url : defaultMsgBack;
  const okUrl = layout.msgUI.okButton.image ? resources.get(layout.msgUI.okButton.image).url : defaultMsgOkButton;

  const { width, height } = hooks.useImageSize(url);
  const content = layout.msgUI?.format.replace(TEXT_PLACEHOLDER, manager.msg);

  const { width: okWidth, height: okHeight } = hooks.useImageSize(okUrl);

  return (
    <>
      {!layout.playerUI.disableShade ? (
        <AeroEffect show={manager.isMsgShown} effect="fade" duration={layout.msgUI.effect.time}>
          <AeroOverlay onClick={onClose} />
        </AeroEffect>
      ) : null}
      <MsgContainer>
        <AeroEffect show={manager.isMsgShown} effect={layout.msgUI.effect.name} duration={layout.msgUI.effect.time}>
          <MsgBody x={x} y={y} width={width} height={height} backgroundImage={url}>
            <MsgTextContainer ui={layout.msgUI}>
              <AeroCustomScroll>{manager.msg && <Content content={content} />}</AeroCustomScroll>
            </MsgTextContainer>
            <MsgButton
              x={layout.msgUI.okButton.x}
              y={layout.msgUI.okButton.y}
              backgroundImage={okUrl}
              width={okWidth}
              height={okHeight}
              onClick={onClose}
            ></MsgButton>
          </MsgBody>
        </AeroEffect>
      </MsgContainer>
    </>
  );
});

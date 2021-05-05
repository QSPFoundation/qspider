import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';
import { useAeroLayout } from '../../../game/aero/aero-layout';
import { useClickCoordinates } from '../../../hooks/click-coordinates';
import { Overlay } from '../../ui-blocks/overlay';
import styled from '@emotion/styled';
import { WithTheme } from '../../../theme.types';
import { useImageSize } from '../../../hooks/image-size';
import { MsgUI, TEXT_PLACEHOLDER } from '@qspider/qsp-wasm';
import { useResources } from '../../../game/resource-manager';
import { AeroEffect } from '../effects/aero-effect';
import { AeroCustomScroll } from '../aero-custom-scroll';

import defaultMsgBack from '../../../../assets/aero/msg_back.png';
import defaultMsgOkButton from '../../../../assets/aero/msg_ok.png';

const MsgContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
`;

const MsgBody = styled.div<
  WithTheme & { width: number; height: number; x: number; y: number; backgroundImage?: string }
>`
  background-image: ${(props) => `url(${props.backgroundImage})`};
  background-color: ${(props) => props.theme.backgroundColor};
  font-size: ${(props) => props.theme.fontSize}pt;
  font-family: ${(props) => props.theme.fontName};
  color: ${(props) => props.theme.textColor};
  width: ${(props) => props.width || 320}px;
  height: ${(props) => props.height || 320}px;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  pointer-events: auto;
  position: relative;
  display: flex;
`;

const MsgTextContainer = styled.div<{ ui: MsgUI }>`
  position: absolute;
  width: ${(props) => props.ui.text.width}px;
  height: ${(props) => props.ui.text.height}px;
  top: ${(props) => props.ui.text.y}px;
  left: ${(props) => props.ui.text.x}px;
  white-space: pre-wrap;
`;

const MsgButton = styled.button<
  WithTheme & { x?: number; y?: number; backgroundImage: string; width: number; height: number }
>`
  -webkit-font-smoothing: antialiased;
  -webkit-appearance: none;
  cursor: pointer;
  position: absolute;
  border: none;
  left: ${(props) => props.x || 0}px;
  top: ${(props) => props.y || 0}px;
  width: ${(props) => props.width + 'px' || 'auto'};
  height: ${(props) => props.height + 'px' || 'auto'};
  box-sizing: border-box;
  background-color: transparent;
  background-image: ${(props) => `url(${props.backgroundImage})`};
  color: ${(props) => props.theme.textColor};
  font-size: ${(props) => props.theme.fontSize}pt;
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

  const coordinates = useClickCoordinates();
  const x = layout.msgUI && layout.msgUI.x >= 0 ? layout.msgUI.x : coordinates.x;
  const y = layout.msgUI && layout.msgUI.y >= 0 ? layout.msgUI.y : coordinates.y;

  const url = layout.msgUI.backImage ? resources.get(layout.msgUI.backImage).url : defaultMsgBack;
  const okUrl = layout.msgUI.okButton.image ? resources.get(layout.msgUI.okButton.image).url : defaultMsgOkButton;

  const { width, height } = useImageSize(url);
  const content = layout.msgUI?.format.replace(TEXT_PLACEHOLDER, manager.msg);

  const { width: okWidth, height: okHeight } = useImageSize(okUrl);

  return (
    <>
      {manager.isMsgShown ? <Overlay onClick={onClose} /> : null}
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

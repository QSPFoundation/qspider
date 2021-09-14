import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';
import { useAeroLayout } from '../../../game/aero/aero-layout';
import { useClickCoordinates } from '../../../hooks/click-coordinates';
import { Overlay } from '../../ui-blocks/overlay';
import styled from '@emotion/styled';
import { useImageSize } from '../../../hooks/image-size';
import { InputUI, TEXT_PLACEHOLDER } from '@qspider/qsp-wasm';
import { useResources } from '../../../game/resource-manager';
import { AeroEffect } from '../effects/aero-effect';
import { AeroCustomScroll } from '../aero-custom-scroll';

import defaultInputBack from '../../../../assets/aero/input_back.png';
import defaultInputOk from '../../../../assets/aero/input_ok.png';
import defaultInputCancel from '../../../../assets/aero/input_cancel.png';

const InputContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
`;

const InputBody = styled.div<{ width: number; height: number; x: number; y: number; backgroundImage?: string }>`
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

const InputTextContainer = styled.div<{ ui: InputUI }>`
  position: absolute;
  width: ${(props) => props.ui.text.width}px;
  height: ${(props) => props.ui.text.height}px;
  top: ${(props) => props.ui.text.y}px;
  left: ${(props) => props.ui.text.x}px;
  white-space: pre-wrap;
`;

const InputButton = styled.button<{ x?: number; y?: number; backgroundImage?: string; width: number; height: number }>`
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
  background-image: ${(props) => `url("${props.backgroundImage}")`};
  background-color: transparent;
  color: ${(props) => props.theme.textColor};
  font-size: ${(props) => props.theme.fontSize}pt;

  &:focus {
    outline: none;
  }
`;

const InputField = styled.input<{ ui: InputUI }>`
  position: absolute;
  left: ${(props) => props.ui.field.x}px;
  top: ${(props) => props.ui.field.y}px;
  width: ${(props) => props.ui.field.width}px;
  height: ${(props) => props.ui.field.height}px;
  padding: 2px 5px;
  background: transparent;
  color: ${(props) => props.theme.textColor};
  border: none;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 5px 0px rgba(0, 0, 0, 0.75);
  }
`;

export const AeroInputDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const layout = useAeroLayout();
  const resources = useResources();
  const [inputText, setInputText] = useState('');

  const onClose = () => {
    manager.closeInput(inputText);
    setInputText('');
  };

  const coordinates = useClickCoordinates();
  const x = layout.inputUI && layout.inputUI.x >= 0 ? layout.inputUI.x : coordinates.x;
  const y = layout.inputUI && layout.inputUI.y >= 0 ? layout.inputUI.y : coordinates.y;

  const url = layout.inputUI.backImage ? resources.get(layout.inputUI.backImage).url : defaultInputBack;
  const okUrl = layout.inputUI.okButton.image ? resources.get(layout.inputUI.okButton.image).url : defaultInputOk;
  const cancelUrl = layout.inputUI.cancelButton.image
    ? resources.get(layout.inputUI.cancelButton.image).url
    : defaultInputCancel;

  const { width, height } = useImageSize(url);
  const content = layout.inputUI?.format.replace(TEXT_PLACEHOLDER, manager.input);

  const { width: okWidth, height: okHeight } = useImageSize(okUrl);
  const { width: cancelWidth, height: cancelHeight } = useImageSize(cancelUrl);

  return (
    <>
      {manager.isInputShown && !layout.playerUI.disableShade ? <Overlay onClick={onClose} /> : null}
      <InputContainer>
        <AeroEffect
          show={manager.isInputShown}
          effect={layout.inputUI.effect.name}
          duration={layout.inputUI.effect.time}
        >
          <InputBody x={x} y={y} width={width} height={height} backgroundImage={url}>
            <InputTextContainer ui={layout.inputUI}>
              <AeroCustomScroll>{content && <Content content={content} />}</AeroCustomScroll>
            </InputTextContainer>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                manager.closeInput(inputText);
                setInputText('');
              }}
            >
              <InputField
                autoFocus
                autoComplete="off"
                tabIndex={0}
                name="input"
                value={inputText}
                ui={layout.inputUI}
                onChange={(e) => {
                  setInputText(e.target.value);
                }}
              />
            </form>
            <InputButton
              x={layout.inputUI.okButton.x}
              y={layout.inputUI.okButton.y}
              backgroundImage={okUrl}
              width={okWidth}
              height={okHeight}
              onClick={() => {
                manager.closeInput(inputText);
                setInputText('');
              }}
            ></InputButton>
            <InputButton
              x={layout.inputUI.cancelButton.x}
              y={layout.inputUI.cancelButton.y}
              backgroundImage={cancelUrl}
              width={cancelWidth}
              height={cancelHeight}
              onClick={() => {
                manager.closeInput('');
                setInputText('');
              }}
            ></InputButton>
          </InputBody>
        </AeroEffect>
      </InputContainer>
    </>
  );
});

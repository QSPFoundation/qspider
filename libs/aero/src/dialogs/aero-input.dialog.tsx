import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { AeroEffect } from '../effects/aero-effect';
import { AeroCustomScroll } from '../aero-custom-scroll';

import defaultInputBack from '../assets/input_back.png';
import defaultInputOk from '../assets/input_ok.png';
import defaultInputCancel from '../assets/input_cancel.png';
import { AeroOverlay } from '../aero-overlay';
import { useGameManager, useResources } from '@qspider/providers';
import { TEXT_PLACEHOLDER, useAeroLayout } from '../aero-layout';
import { Content, hooks } from '@qspider/components';
import { InputUI } from '../aero.types';

const InputContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
`;

const InputBody = styled.div<{ width: number; height: number; x: number; y: number; backgroundImage?: string }>`
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

const InputTextContainer = styled.div<{ ui: InputUI }>`
  position: absolute;
  width: ${(props): number => props.ui.text.width}px;
  height: ${(props): number => props.ui.text.height}px;
  top: ${(props): number => props.ui.text.y}px;
  left: ${(props): number => props.ui.text.x}px;
  white-space: pre-wrap;
`;

const InputButton = styled.button<{ x?: number; y?: number; backgroundImage?: string; width: number; height: number }>`
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
  background-image: ${(props): string => `url("${props.backgroundImage}")`};
  background-color: transparent;

  &:focus {
    outline: none;
  }
`;

const InputField = styled.input<{ ui: InputUI }>`
  position: absolute;
  left: ${(props): number => props.ui.field.x}px;
  top: ${(props): number => props.ui.field.y}px;
  width: ${(props): number => props.ui.field.width}px;
  height: ${(props): number => props.ui.field.height}px;
  padding: 2px 5px;
  background: transparent;
  border: none;

  &:focus {
    outline: none;
  }
`;

export const AeroInputDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const layout = useAeroLayout();
  const resources = useResources();
  const [inputText, setInputText] = useState('');

  const onClose = (): void => {
    manager.closeInput(inputText);
    setInputText('');
  };

  const coordinates = hooks.useClickCoordinates();
  const x = layout.inputUI && layout.inputUI.x >= 0 ? layout.inputUI.x : coordinates.x;
  const y = layout.inputUI && layout.inputUI.y >= 0 ? layout.inputUI.y : coordinates.y;

  const url = layout.inputUI.backImage ? resources.get(layout.inputUI.backImage).url : defaultInputBack;
  const okUrl = layout.inputUI.okButton.image ? resources.get(layout.inputUI.okButton.image).url : defaultInputOk;
  const cancelUrl = layout.inputUI.cancelButton.image
    ? resources.get(layout.inputUI.cancelButton.image).url
    : defaultInputCancel;

  const { width, height } = hooks.useImageSize(url);
  const content = layout.inputUI?.format.replace(TEXT_PLACEHOLDER, manager.input);

  const { width: okWidth, height: okHeight } = hooks.useImageSize(okUrl);
  const { width: cancelWidth, height: cancelHeight } = hooks.useImageSize(cancelUrl);

  return (
    <>
      {!layout.playerUI.disableShade ? (
        <AeroEffect show={manager.isInputShown} effect="fade" duration={layout.inputUI.effect.time}>
          <AeroOverlay onClick={onClose} />
        </AeroEffect>
      ) : null}
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
              onSubmit={(e): void => {
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
                onChange={(e): void => {
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
              onClick={(): void => {
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
              onClick={(): void => {
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

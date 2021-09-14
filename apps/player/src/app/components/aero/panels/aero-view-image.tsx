import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import styled from '@emotion/styled';
import { ViewUI } from '@qspider/qsp-wasm';
import { useAeroLayout } from '../../../game/aero/aero-layout';
import { AeroEffect } from '../effects/aero-effect';

const ViewImageContainer = styled.div<{ ui: ViewUI; url: string }>`
  position: absolute;
  left: ${(props) => props.ui.x}px;
  top: ${(props) => props.ui.y}px;
  width: ${(props) => props.ui.width}px;
  height: ${(props) => props.ui.height}px;
  background-image: ${(props) => (props.url ? `url("${props.url}")` : 'none')};
  background-size: cover;
  background-position: center;
`;

export const AeroViewImagePanel: React.FC = observer(() => {
  const manager = useGameManager();
  const layout = useAeroLayout();
  const onClick = useCallback(() => {
    if (manager.isViewShown && !layout.viewUI.alwaysShow) {
      manager.closeView();
    }
  }, [manager, layout.viewUI]);

  if (!layout.viewUI) return null;
  return (
    <AeroEffect show={manager.isViewShown} effect={layout.viewUI.effect.name} duration={layout.viewUI.effect.time}>
      <ViewImageContainer ui={layout.viewUI} url={manager.viewSrc} onClick={onClick} />;
    </AeroEffect>
  );
});

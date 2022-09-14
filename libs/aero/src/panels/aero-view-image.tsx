import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { AeroEffect } from '../effects/aero-effect';
import { useGameManager } from '@qspider/providers';
import { useAeroLayout } from '../aero-layout';
import { ViewUI } from '../aero.types';

const ViewImageContainer = styled.div<{ ui: ViewUI; url: string }>`
  position: absolute;
  left: ${(props): number => props.ui.x}px;
  top: ${(props): number => props.ui.y}px;
  width: ${(props): number => props.ui.width}px;
  height: ${(props): number => props.ui.height}px;
  background-image: ${(props): string => (props.url ? `url("${props.url}")` : 'none')};
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
      <ViewImageContainer ui={layout.viewUI} url={manager.viewSrc} onClick={onClick} />
    </AeroEffect>
  );
});

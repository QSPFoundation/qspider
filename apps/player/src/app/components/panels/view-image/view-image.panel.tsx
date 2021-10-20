import React from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { Panel } from '../../ui-blocks/panel';
import styled from '@emotion/styled';

const ViewImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ViewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

export const ViewImagePanel: React.FC = observer(() => {
  const manager = useGameManager();
  if (!manager.isViewShown) return null;
  return (
    <Panel withPadding data-qsp="view">
      <ViewImageContainer>
        <ViewImage src={manager.viewSrc} alt="" />
      </ViewImageContainer>
    </Panel>
  );
});

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { Panel } from '../../ui-blocks/panel';

export const ViewImagePanel: React.FC = observer(() => {
  const manager = useGameManager();
  if (!manager.isViewShown) return null;
  return (
    <Panel withPadding>
      <img src={manager.viewSrc} alt="" />
    </Panel>
  );
});

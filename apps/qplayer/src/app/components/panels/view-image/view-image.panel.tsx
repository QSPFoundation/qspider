import React from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from '../../ui-blocks/modal';
import { useGameManager } from '../../../game/manager';

export const ViewImagePanel: React.FC = observer(() => {
  const manager = useGameManager();
  if (!manager.isViewShown) return null;
  return (
    <Modal onClose={() => manager.closeView()}>
      <img src={manager.viewSrc} alt="" />
    </Modal>
  );
});

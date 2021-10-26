import { observer } from 'mobx-react-lite';
import { useLayout } from '../../game/layout';
import { QspGUIPanel } from '../../constants';
import { ViewImagePanel } from '../panels/view-image/view-image.panel';
import React from 'react';
import { Modal } from '../ui-blocks/modal';
import { useGameManager } from '../../game/manager';

const pannelsMap = {
  [QspGUIPanel.ImageView]: ViewImagePanel,
};

export const FloatingContainer: React.FC = observer(() => {
  const manager = useGameManager();
  const { floatingPanels } = useLayout();
  return (
    <>
      {floatingPanels.map(([name, width, height]) => {
        const Panel = pannelsMap[name];
        if (!Panel) return null;
        return (
          <Modal key={name} onClose={() => manager.closeView()} hideButtons dataQsp={name}>
            <Panel></Panel>
          </Modal>
        );
      })}
    </>
  );
});

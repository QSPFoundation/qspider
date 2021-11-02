import { observer } from 'mobx-react-lite';
import React from 'react';
import { QspGUIPanel } from '@qspider/contracts';
import { useGameManager } from '@qspider/providers';
import { Modal } from '@qspider/components';
import { ViewImagePanel } from '../panels/view-image';

const pannelsMap: Record<string, React.FC> = {
  [QspGUIPanel.ImageView]: ViewImagePanel,
};

export const FloatingContainer: React.FC = observer(() => {
  const manager = useGameManager();
  const { floatingPanels } = useClassicLayout();
  return (
    <>
      {floatingPanels.map(([name, width, height]) => {
        const Panel = pannelsMap[name];
        if (!Panel) return null;
        return (
          <Modal key={name} onClose={(): void => manager.closeView()} hideButtons dataQsp={name}>
            <Panel></Panel>
          </Modal>
        );
      })}
    </>
  );
});

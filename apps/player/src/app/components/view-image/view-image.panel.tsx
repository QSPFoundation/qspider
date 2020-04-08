import React from 'react';
import { Dialog } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../game/manager';

export const ViewImagePanel: React.FC = observer(() => {
  const manager = useGameManager();

  return (
    <Dialog
      isShown={manager.isViewShown}
      hasHeader={false}
      hasFooter={false}
      onCloseComplete={() => manager.closeView()}
    >
      <img src={manager.viewSrc} alt="" />
    </Dialog>
  );
});

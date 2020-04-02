import React, { useCallback } from 'react';
import { Dialog } from 'evergreen-ui';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';

export const MsgDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const onClose = useCallback(() => {
    manager.closeMsg();
  }, [manager]);
  return (
    <Dialog
      isShown={manager.isMsgShown}
      title="Msg title"
      hasCancel={false}
      confirmLabel="OK"
      onCloseComplete={onClose}
    >
      {manager.msg && <Content content={manager.msg} />}
    </Dialog>
  );
});

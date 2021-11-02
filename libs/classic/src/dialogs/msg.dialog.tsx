import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '@qspider/providers';
import { Content, Modal } from '@qspider/components';

export const MsgDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const onClose = useCallback(() => {
    manager.closeMsg();
  }, [manager]);
  if (!manager.isMsgShown) return null;
  return (
    <Modal onClose={onClose} dataQsp="msg">
      {manager.msg && <Content content={manager.msg} />}
    </Modal>
  );
});

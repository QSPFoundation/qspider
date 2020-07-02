import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameManager } from '../../../game/manager';
import { Content } from '../../content/content';
import { Modal } from '../../ui-blocks/modal';

export const MsgDialog: React.FC = observer(() => {
  const manager = useGameManager();
  const onClose = useCallback(() => {
    manager.closeMsg();
  }, [manager]);
  if (!manager.isMsgShown) return null;
  return (
    <Modal onClose={onClose}>
      {manager.msg && <Content content={manager.msg} />}
    </Modal>
  );
});

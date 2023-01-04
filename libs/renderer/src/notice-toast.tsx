import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useAtom } from '@xoid/react';
import { isNoticeShown$, noticeMessage$ } from '@qspider/game-state';

export const NoticeToast: React.FC = () => {
  const isOpen = useAtom(isNoticeShown$);
  const message = useAtom(noticeMessage$);
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={isNoticeShown$.set}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>Notice</AlertDialog.Title>
          <AlertDialog.Description>{message}</AlertDialog.Description>
          <AlertDialog.Cancel />
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

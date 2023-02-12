import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useAtom } from '@xoid/react';
import { isNoticeShown$, noticeMessage$ } from '@qspider/game-state';
import { useTranslation } from 'react-i18next';

export const NoticeToast: React.FC = () => {
  const isOpen = useAtom(isNoticeShown$);
  const message = useAtom(noticeMessage$);
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={isNoticeShown$.set}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>{t('Notice')}</AlertDialog.Title>
          <AlertDialog.Description>{t(message)}</AlertDialog.Description>
          <AlertDialog.Cancel />
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

import React from 'react';
// import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Toast from '@radix-ui/react-toast';

import { useAtom } from '@xoid/react';
import { isNoticeShown$, noticeMessage$ } from '@qspider/game-state';
import { useTranslation } from 'react-i18next';

export const NoticeToast: React.FC = () => {
  const isOpen = useAtom(isNoticeShown$);
  const message = useAtom(noticeMessage$);
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <Toast.Provider>
      <Toast.Root className="qsp-toast-root" open={isOpen}>
        <Toast.Description className="qsp-toast-description">{t(message)}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="qsp-toast-viewport" />
    </Toast.Provider>
  );
};

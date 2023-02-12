import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useAtom } from '@xoid/react';
import { errorMessage$, isErrorShown$ } from '@qspider/game-state';
import { useTranslation } from 'react-i18next';

export const ErrorAlert: React.FC = () => {
  const { t } = useTranslation();
  const isOpen = useAtom(isErrorShown$);
  const message = useAtom(errorMessage$);
  if (!isOpen) return null;
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={isErrorShown$.set}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>{t('Error')}</AlertDialog.Title>
          <AlertDialog.Description>{t(message)}</AlertDialog.Description>
          <AlertDialog.Cancel />
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

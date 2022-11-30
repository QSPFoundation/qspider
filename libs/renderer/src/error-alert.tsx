import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useAtom } from '@xoid/react';
import { errorMessage$, isErrorShown$ } from '@qspider/game-state';

export const ErrorAlert: React.FC = () => {
  const isOpen = useAtom(isErrorShown$);
  const message = useAtom(errorMessage$);
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={isErrorShown$.set}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>Error</AlertDialog.Title>
          <AlertDialog.Description>{message}</AlertDialog.Description>
          <AlertDialog.Cancel />
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

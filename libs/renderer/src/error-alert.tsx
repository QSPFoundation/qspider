import React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { useAtom } from '@xoid/react';
import { errorMessage$, isErrorShown$ } from '@qspider/game-state';
import { useTranslation } from 'react-i18next';
import { Cross1Icon } from '@radix-ui/react-icons';

export const ErrorAlert: React.FC = () => {
  const { t } = useTranslation();
  const isOpen = useAtom(isErrorShown$);
  const message = useAtom(errorMessage$);
  if (!isOpen) return null;
  return (
    <Toast.Provider>
      <Toast.Root className="qsp-toast-root error" open={isOpen} onOpenChange={(): void => isErrorShown$.set(false)}>
        <Toast.Description className="qsp-toast-description">{t(message)}</Toast.Description>
        <Toast.Close className="q-ghost-button">
          <Cross1Icon />
        </Toast.Close>
      </Toast.Root>
      <Toast.Viewport className="qsp-toast-viewport" />
    </Toast.Provider>
  );
};

import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import React, { ReactNode } from 'react';
import { qspApi$ } from '@qspider/game-state';

declare const QSPIDER_VERSION: string;

export const QspiderVersionModal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const qspVersion = qspApi$.value?.version();
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Overlay className="qspider-dialog-overlay" />
      <Dialog.Content className="qspider-dialog-content">
        <VisuallyHidden>
          <Dialog.Title>qSpider version</Dialog.Title>
          <Dialog.Description></Dialog.Description>
        </VisuallyHidden>
        <div className="qspider-logo">spider</div>
        <div>Version: {QSPIDER_VERSION}</div>
        <div>QSP version: {qspVersion}</div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

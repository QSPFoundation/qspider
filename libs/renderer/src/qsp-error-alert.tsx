import { qspError$ } from '@qspider/game-state';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useAtom } from '@xoid/react';

export const QspErrorAlert: React.FC = () => {
  const errorData = useAtom(qspError$);
  if (!errorData) return null;
  return (
    <AlertDialog.Root open={true} onOpenChange={(): void => qspError$.set(null)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>Error</AlertDialog.Title>
          <AlertDialog.Description>
            Error: {errorData.description}
            <br />
            {errorData.code >= 0 ? (
              <>
                Error code: {errorData.code}
                <br />
              </>
            ) : (
              ''
            )}
            {errorData.location && (
              <>
                Location: {errorData.location}
                <br />
              </>
            )}
            {errorData.actionIndex >= 0 ? (
              <>
                Action index: {errorData.actionIndex} <br />
              </>
            ) : (
              ''
            )}
            {errorData.line >= 0 ? 'Line: ' + errorData.line : ''}
          </AlertDialog.Description>
          <AlertDialog.Cancel>Close</AlertDialog.Cancel>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

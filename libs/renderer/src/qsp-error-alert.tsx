import { qspError$ } from '@qspider/game-state';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useAtom } from '@xoid/react';
import { useTranslation } from 'react-i18next';

export const QspErrorAlert: React.FC = () => {
  const errorData = useAtom(qspError$);
  const { t } = useTranslation();
  if (!errorData) return null;
  return (
    <AlertDialog.Root open={true} onOpenChange={(): void => qspError$.set(null)}>
      <AlertDialog.Portal container={document.getElementById('portal-container')}>
        <AlertDialog.Overlay className="qsp-overlay" />
        <AlertDialog.Content className="qsp-dialog-container qsp-error-container">
          <div className="qsp-error">
            <AlertDialog.Title>{t('Error')}</AlertDialog.Title>
            <AlertDialog.Description>
              {t('Error')}: {t(errorData.description)}
              <br />
              {errorData.code >= 0 ? (
                <>
                  {t('Error code')}: {errorData.code}
                  <br />
                </>
              ) : (
                ''
              )}
              {errorData.location && (
                <>
                  {t('Location')}: {errorData.location}
                  <br />
                </>
              )}
              {errorData.actionIndex >= 0 ? (
                <>
                  {t('Action index')}: {errorData.actionIndex} <br />
                </>
              ) : (
                ''
              )}
              {errorData.line >= 0 ? t('Line') + ': ' + errorData.line : ''}
            </AlertDialog.Description>
            <div className="qsp-dialog-buttons">
              <AlertDialog.Cancel className="qsp-button">{t('Close')}</AlertDialog.Cancel>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

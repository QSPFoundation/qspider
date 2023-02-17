import { toggleTheme } from '@qspider/game-state';
import { SunIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Tooltip } from './primitives';

export const QspiderThemeSwitch: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Tooltip content={t('Toggle theme') ?? ''}>
      <button
        className="q-ghost-button"
        aria-label={t('toggle a light and dark color scheme') ?? ''}
        onClick={toggleTheme}
      >
        <SunIcon />
      </button>
    </Tooltip>
  );
};

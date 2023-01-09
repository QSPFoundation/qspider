import { toggleTheme } from '@qspider/game-state';
import { SunIcon } from '@radix-ui/react-icons';

export const QspiderThemeSwitch: React.FC = () => {
  return (
    <button
      className="q-ghost-button"
      aria-label="toggle a light and dark color scheme"
      title="Toggle theme"
      onClick={toggleTheme}
    >
      <SunIcon />
    </button>
  );
};

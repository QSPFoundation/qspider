import { ProvidedComponents } from '@qspider/contracts';
import { useComponent } from '@qspider/game-state';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';
import { LocaleSelector } from './locale-selector';
import { QspiderThemeSwitch } from './qspider-theme-switch';

export const QspiderPlayer: React.FC = () => {
  const { t } = useTranslation();
  const OpenGameButton = useComponent(ProvidedComponents.OpenGameButton);
  return (
    <div className="qspider-player">
      <nav className="qspider-navbar">
        <div className="qspider-logo">spider</div>
        <div className="qspider-nav">
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }): string => (isActive ? 'qspider-active' : '')}>
                {t('Game Shelf')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/catalog" className={({ isActive }): string => (isActive ? 'qspider-active' : '')}>
                {t('Qsp Game Catalog')}
              </NavLink>
            </li>
          </ul>
          <div className="qspider-block">
            <OpenGameButton />
            <LocaleSelector />
            <QspiderThemeSwitch />
          </div>
        </div>
      </nav>
      <main className="qspider-player-main">
        <Outlet />
      </main>
    </div>
  );
};

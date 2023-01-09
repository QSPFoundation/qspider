import { useComponents } from '@qspider/providers';
import { NavLink, Outlet } from 'react-router-dom';
import { QspiderThemeSwitch } from './qspider-theme-switch';

export const QspiderPlayer: React.FC = () => {
  const { OpenGameButton } = useComponents();
  return (
    <div className="qspider-player">
      <nav className="qspider-navbar">
        <div className="qspider-logo">spider</div>
        <div className="qspider-nav">
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }): string => (isActive ? 'qspider-active' : '')}>
                {' '}
                Game Shelf
              </NavLink>
            </li>
            <li>
              <NavLink to="/catalog" className={({ isActive }): string => (isActive ? 'qspider-active' : '')}>
                Qsp Game Catalog
              </NavLink>
            </li>
          </ul>
          <div className="qspider-block">
            <OpenGameButton />
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

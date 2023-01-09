import { useComponents } from '@qspider/providers';
import { NavLink, Outlet } from 'react-router-dom';

export const QspiderPlayer: React.FC = () => {
  const { OpenGameButton } = useComponents();
  return (
    <div className="qspider-player">
      <nav className="qspider-navbar">
        <div className="qspider-logo"></div>
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
          <OpenGameButton />
        </div>
      </nav>
      <main className="qspider-player-main">
        <Outlet />
      </main>
    </div>
  );
};

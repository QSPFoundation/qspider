import { ProvidedComponents } from '@qspider/contracts';
import { useComponent } from '@qspider/game-state';
import { LocaleSelector, QspiderThemeSwitch } from '@qspider/renderer';
import { useAtom } from '@xoid/react';
import { useTranslation } from 'react-i18next';
import { currentMode$, navigateTo } from '../game-shelf';
import { GameShelf } from './game-shelf';
import { QspCatalog } from './qsp-catalog';

export const QspiderPlayer: React.FC = () => {
  const { t } = useTranslation();
  const OpenGameButton = useComponent(ProvidedComponents.OpenGameButton);
  const mode = useAtom(currentMode$);
  return (
    <div className="qspider-player">
      <nav className="qspider-navbar">
        <div className="qspider-logo">spider</div>
        <div className="qspider-nav">
          <ul>
            <li>
              <a
                href="#"
                onClick={(e): void => {
                  e.preventDefault();
                  navigateTo('');
                }}
                className={mode === 'shelf' ? 'qspider-active' : ''}
              >
                {t('Game Shelf')}
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e): void => {
                  e.preventDefault();
                  navigateTo('catalog');
                }}
                className={mode === 'catalog' ? 'qspider-active' : ''}
              >
                {t('Qsp Game Catalog')}
              </a>
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
        {mode === 'shelf' && <GameShelf />}
        {mode === 'catalog' && <QspCatalog />}
      </main>
    </div>
  );
};

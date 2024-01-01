import { currentGameEntry$, input$, isPauseScreenVisible$, menu$, msg$, view$, wait$ } from '@qspider/game-state';
import { throttle } from '@qspider/utils';
import { useAtom } from '@xoid/react';
import { ClickCoordinates } from './click-coordinates';
import { useEventListener } from './hooks/event-listener';
import { QspiderLoader } from './loader';
import { QspErrorAlert } from './qsp-error-alert';
import { QspPlayer } from './theme-core';
import { QspCSSVariables } from './theme-core/css-variables';
import { WaitLock } from './wait-lock';
import { QspCSSLinks } from './theme-core/css-links';
import { QspScriptLinks } from './theme-core/script-links';

const handler = throttle((e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    if (
      wait$.value ||
      msg$.value.isOpen ||
      input$.value.isOpen ||
      menu$.value.isOpen ||
      isPauseScreenVisible$.value ||
      (view$.value.isOpen && view$.value.isModal)
    )
      return;
    e.preventDefault();
    e.stopPropagation();
    isPauseScreenVisible$.set(true);
  }
}, 10);

export const GameRunner: React.FC = () => {
  const currentGame = useAtom(currentGameEntry$);
  useEventListener('keydown', handler, document, { capture: true });
  if (!currentGame) return <QspiderLoader />;
  return (
    <qsp-game-root>
      <ClickCoordinates />
      <QspCSSVariables />
      <QspCSSLinks />
      <QspPlayer />
      <WaitLock />
      <QspErrorAlert />
      <QspScriptLinks />
    </qsp-game-root>
  );
};

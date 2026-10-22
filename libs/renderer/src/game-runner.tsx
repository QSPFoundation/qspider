import {
  currentGameEntry$,
  input$,
  isPauseScreenVisible$,
  menu$,
  msg$,
  openPauseScreen,
  qspApi$,
  requestedAction$,
  view$,
  wait$,
} from '@qspider/game-state';
import { throttle } from '@qspider/utils';
import { useAtom } from '@xoid/react';
import { isTouchDevice } from '@qspider/utils';
import { ClickCoordinates } from './click-coordinates';
import { useEventListener } from './hooks/event-listener';
import { QspiderLoader } from './loader';
import { QspErrorAlert } from './qsp-error-alert';
import { QspPlayer } from './theme-core';
import { QspCSSVariables } from './theme-core/css-variables';
import { WaitLock } from './wait-lock';
import { QspCSSLinks } from './theme-core/css-links';
import { QspScriptLinks } from './theme-core/script-links';
import { TouchPauseButton } from './touch-pause-button';

const openPauseOnEscape = throttle((e: KeyboardEvent): void => {
  if (!currentGameEntry$.value) return;
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
  const nosave = qspApi$.value?.readVariable('NOSAVE');
  if (nosave) {
    requestedAction$.set('load');
  }
  openPauseScreen();
}, 10);

// Only Escape is throttled: throttling every key let a preceding key (e.g. F5) swallow a quick Escape.
const handler = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') openPauseOnEscape(e);
};

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
      {isTouchDevice() && <TouchPauseButton />}
    </qsp-game-root>
  );
};

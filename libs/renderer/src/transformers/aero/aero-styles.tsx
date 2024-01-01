import { currentAeroHeight$, currentAeroWidth$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';

export const AeroStyles: React.FC = () => {
  const width = useAtom(currentAeroWidth$);
  const height = useAtom(currentAeroHeight$);
  const style = `
  qsp-game-root, #portal-container {
    --aero-player-width: ${width}px;
    --aero-player-height: ${height}px;
  }`;
  return <style>{style}</style>;
};

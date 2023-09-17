import { useAtom } from '@xoid/react';
import { currentCssLinks$, initialBaseUrl$ } from '@qspider/game-state';

export const QspCSSLinks: React.FC = () => {
  const cssLinks = useAtom(currentCssLinks$);
  const baseUrl = useAtom(initialBaseUrl$);
  return (
    <>
      {cssLinks.map((src) => (
        <link rel="stylesheet" href={src.startsWith('qspider:') ? src.replace('qspider:', baseUrl) : src} key={src} />
      ))}
    </>
  );
};

import { useAtom } from '@xoid/react';
import { currentCssLinks$, initialBaseUrl$ } from '@qspider/game-state';
import { resolveQspiderLink } from './theme-link-url';

export const QspCSSLinks: React.FC = () => {
  const cssLinks = useAtom(currentCssLinks$);
  const baseUrl = useAtom(initialBaseUrl$);
  return (
    <>
      {cssLinks.map((src) => (
        <link rel="stylesheet" href={resolveQspiderLink(src, baseUrl)} key={src} />
      ))}
    </>
  );
};

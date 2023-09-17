import { useAtom } from '@xoid/react';
import { currentScriptLinks$, initialBaseUrl$ } from '@qspider/game-state';

export const QspScriptLinks: React.FC = () => {
  const scriptLinks = useAtom(currentScriptLinks$);
  const baseUrl = useAtom(initialBaseUrl$);
  return (
    <>
      {scriptLinks.map((src) => (
        <script src={src.startsWith('qspider:') ? src.replace('qspider:', baseUrl) : src} key={src} />
      ))}
    </>
  );
};

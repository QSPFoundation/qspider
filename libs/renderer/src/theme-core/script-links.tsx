import { useEffect } from 'react';
import { useAtom } from '@xoid/react';
import { currentScriptLinks$, initialBaseUrl$ } from '@qspider/game-state';

/**
 * Runs the current theme's script links. A `<script src>` rendered by React never executes, so each
 * link is appended to `document.head` as a real element (the way game `resources.scripts` are loaded),
 * and removed when the links change or the game stops, so a theme switch does not stack scripts.
 */
export const QspScriptLinks: React.FC = () => {
  const scriptLinks = useAtom(currentScriptLinks$);
  const baseUrl = useAtom(initialBaseUrl$);
  useEffect(() => {
    const added = scriptLinks.map((src) => {
      const script = document.createElement('script');
      script.async = false; // dynamically added scripts are async by default; keep the declared order
      script.src = src.startsWith('qspider:') ? src.replace('qspider:', baseUrl) : src;
      document.head.appendChild(script);
      return script;
    });
    return (): void => added.forEach((script) => script.remove());
  }, [scriptLinks, baseUrl]);
  return null;
};

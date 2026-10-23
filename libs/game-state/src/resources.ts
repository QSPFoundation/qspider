import { GameDescriptor } from '@qspider/contracts';

/** A resource that never reports back must not hold the game back forever. */
const RESOURCE_TIMEOUT_MS = 15_000;

/**
 * Loads the game.cfg styles, scripts and fonts and answers when every one has loaded or failed. Scripts run in
 * the order they are listed. Resolves with the paths that failed (404, a bad font, no answer in time), so the
 * caller can say so; it never rejects, so a broken resource cannot keep the game from starting.
 */
export async function loadAdditionalResources(resources: GameDescriptor['resources']): Promise<string[]> {
  if (!resources) return [];
  const { styles, scripts, fonts } = resources;
  const results = await Promise.all([
    ...(styles ?? []).map(loadStyle),
    ...(scripts ?? []).map(loadScript),
    ...(fonts && fonts.length > 0 ? loadFonts(fonts) : []),
  ]);
  return results.filter((failed): failed is string => failed !== null);
}

/** Resolves with `path` when the element does not report `load` in time or reports `error`, else with null. */
function whenLoaded(element: HTMLElement, path: string): Promise<string | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(path), RESOURCE_TIMEOUT_MS);
    const settle = (failed: boolean): void => {
      clearTimeout(timer);
      resolve(failed ? path : null);
    };
    element.onload = (): void => settle(false);
    element.onerror = (): void => settle(true);
  });
}

function loadStyle(style: string): Promise<string | null> {
  const gameStyle = document.createElement('link');
  gameStyle.href = style;
  gameStyle.rel = 'stylesheet';
  gameStyle.dataset['qspiderResource'] = 'style';
  const loaded = whenLoaded(gameStyle, style);
  document.head.appendChild(gameStyle);
  return loaded;
}

function loadScript(script: string): Promise<string | null> {
  const gameScript = document.createElement('script');
  gameScript.type = 'text/javascript';
  gameScript.async = false; // dynamically added scripts are async by default; keep the listed order
  gameScript.src = script;
  gameScript.dataset['qspiderResource'] = 'script';
  const loaded = whenLoaded(gameScript, script);
  document.head.appendChild(gameScript);
  return loaded;
}

function loadFonts(fonts: [string, string, string, string][]): Promise<string | null>[] {
  const css = [];
  for (const [name, path, weight, style] of fonts) {
    css.push(`
    @font-face {
      font-family: "${name}";
      src: url("${path}");
      font-display: block;
      font-style: ${style || 'normal'};
      font-weight: ${weight || 'normal'};
    }
  `);
  }
  const gameStyle = document.createElement('style');
  gameStyle.innerText = css.join('\n');
  gameStyle.dataset['qspiderResource'] = 'style';
  document.head.appendChild(gameStyle);
  // A face downloads when something uses it, so ask for each one.
  return fonts.map(([name, path, weight, style]) => {
    const request = document.fonts.load(`${style || 'normal'} ${weight || 'normal'} 1em "${name}"`).then(
      () => null,
      () => path,
    );
    const timeout = new Promise<string>((resolve) => setTimeout(() => resolve(path), RESOURCE_TIMEOUT_MS));
    return Promise.race([request, timeout]);
  });
}

export function clearAdditionalResources(): void {
  document.querySelectorAll('[data-qspider-resource]').forEach((el) => el.remove());
}

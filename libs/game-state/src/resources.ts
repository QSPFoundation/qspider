import { GameDescriptor } from '@qspider/contracts';

/**
 * A resource that never reports back must not hold the game back forever. Scripts run in their listed order
 * (async=false), so a stalled script also delays the scripts after it: they still run, late (after it settles or
 * fails).
 */
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

/** The faces this module added to document.fonts, removed again when the game stops. */
const addedFonts: FontFace[] = [];
/** Bumped when the game's resources are cleared: a face that finishes loading later belongs to a past game. */
let generation = 0;

/**
 * Each face is built and loaded explicitly: an @font-face rule in a <style> is not reliably registered when
 * document.fonts.load() runs (WebKit then resolves without loading it, and the game would start without its font).
 * A bad descriptor (the FontFace constructor throws) or a late load only fails that font; it never rejects.
 */
function loadFonts(fonts: [string, string, string, string][]): Promise<string | null>[] {
  return fonts.map(([name, path, weight, style]) => {
    let face: FontFace;
    try {
      face = new FontFace(name, `url("${path}")`, {
        style: style || 'normal',
        weight: weight || 'normal',
        display: 'block',
      });
    } catch {
      return Promise.resolve(path);
    }
    const startedIn = generation;
    let settled = false;
    const request = face.load().then(
      () => {
        if (!settled && startedIn === generation) {
          document.fonts.add(face);
          addedFonts.push(face);
        }
        return null;
      },
      () => path,
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<string>((resolve) => {
      timer = setTimeout(() => resolve(path), RESOURCE_TIMEOUT_MS);
    });
    return Promise.race([request, timeout]).finally(() => {
      settled = true;
      clearTimeout(timer);
    });
  });
}

export function clearAdditionalResources(): void {
  document.querySelectorAll('[data-qspider-resource]').forEach((el) => el.remove());
  generation++;
  for (const face of addedFonts.splice(0)) document.fonts.delete(face);
}

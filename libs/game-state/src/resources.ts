import { GameDescriptor } from '@qspider/contracts';
import { defer } from '@qspider/utils';

export async function loadAdditionalResources(resources: GameDescriptor['resources']): Promise<void> {
  if (!resources) return;
  const { styles, scripts, fonts } = resources;
  const promises = [];
  if (styles) {
    promises.push(loadAdditionalStyles(styles));
  }
  if (scripts) {
    promises.push(loadAdditionalScripts(scripts));
  }
  if (fonts) {
    loadAdditionalFonts(fonts);
  }
  await Promise.allSettled([...promises, document.fonts.ready]);
}

async function loadAdditionalStyles(styles: string[]): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const style of styles) {
    const gameStyle = document.createElement('link');
    gameStyle.href = style;
    gameStyle.rel = 'stylesheet';
    gameStyle.dataset['qspiderResource'] = 'style';
    document.head.appendChild(gameStyle);
  }
  await Promise.allSettled(promises);
}

async function loadAdditionalScripts(scripts: string[]): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const script of scripts) {
    const gameScript = document.createElement('script');
    gameScript.type = 'text/javascript';
    gameScript.src = script;
    gameScript.dataset['qspiderResource'] = 'script';
    const deferred = defer<void>();
    gameScript.onload = (): void => deferred.resolve();
    gameScript.onerror = (): void => deferred.reject(new Error(`File not found: ${script}`));
    promises.push(deferred.promise);
    document.head.appendChild(gameScript);
  }
  await Promise.allSettled(promises);
}

function loadAdditionalFonts(fonts: [string, string, string, string][]): void {
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
}

export function clearAdditionalResources(): void {
  document.querySelectorAll('[data-qspider-resource]').forEach((el) => el.remove());
}

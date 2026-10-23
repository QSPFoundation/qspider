import { equals } from '@serenity-js/assertions';
import { type QuestionAdapter, Task } from '@serenity-js/core';
import { scriptResult } from './page-script';
import { seeScriptEventually } from './see-script-eventually';

// A read-only probe over <img> elements: did the picture really load? Like the probes in page-script.ts,
// the function is serialised into the page (self-contained, plain data back); the script itself runs only
// through scriptResult. The marker is regex-validated before it builds a selector.

/** Where the probe looks: the first <img> with this data-qsp or data-qa value. */
export type ImageTarget = { qsp: string } | { qa: string };

/** `naturalWidth` of the first matching <img> once it has finished loading (0 when it failed), null when absent. */
function loadedWidth(kind: string, value: string): number | null {
  if (!/^[a-z0-9-]+$/.test(value)) throw new Error(`invalid image target "${value}"`);
  const image = document.querySelector(`img[data-${kind}="${value}"]`);
  if (!(image instanceof HTMLImageElement)) return null;
  return image.complete ? image.naturalWidth : null;
}

/** The loaded width of the target image: 0 = loading failed, null = absent or still loading. */
export const ImageLoadedWidth = (target: ImageTarget): QuestionAdapter<number | null> => {
  const [kind, value] = Object.entries(target)[0]!;
  return scriptResult(`the loaded width of ${JSON.stringify(target)}`, loadedWidth, kind, value);
};

/** Eventually the image has loaded and its natural width is `width` (every fixture picture has its own width). */
export const SeeImageLoaded = (target: ImageTarget, width: number): Task =>
  seeScriptEventually(
    ImageLoadedWidth(target),
    equals(width),
    `#actor sees the image ${JSON.stringify(target)} loaded, ${width}px wide`,
  );

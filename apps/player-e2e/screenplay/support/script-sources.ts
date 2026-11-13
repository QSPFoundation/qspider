import { equals } from '@serenity-js/assertions';
import { type QuestionAdapter, Task } from '@serenity-js/core';
import { scriptResult } from './page-script';
import { seeScriptEventually } from './see-script-eventually';

// A read-only probe over the page's <script> elements: where do the scripts come from? Like the probes in
// page-script.ts, the function is serialised into the page (self-contained, plain data back).

/** How many `<script>` elements have a `src` containing `needle` (a host such as `cdn.jsdelivr.net`). */
function scriptSourceCount(needle: string): number {
  return Array.from(document.scripts).filter((script) => script.src.includes(needle)).length;
}

/** The number of page scripts whose `src` contains `needle`. */
export const ScriptSourceCount = (needle: string): QuestionAdapter<number | null> =>
  scriptResult(`the number of scripts loaded from ${needle}`, scriptSourceCount, needle);

/**
 * No script of the page has a `src` containing `needle`. An absence check: see a positive anchor first
 * (the script would be added before what the anchor shows).
 */
export const SeeNoScriptFrom = (needle: string): Task =>
  seeScriptEventually(ScriptSourceCount(needle), equals(0), `#actor sees no script loaded from ${needle}`);

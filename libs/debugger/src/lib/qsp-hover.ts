import type * as Monaco from 'monaco-editor';
import { hoverCodeBlock, hoverReadPlan, readHover, watchActions, type HoverPlan } from '@qspider/game-state';
import { isQspKeyword } from './qsp-language';
import { hoverTargetAt, qspLineTokens, type LineToken } from './qsp-tokens';

const PIN_COMMAND = 'qsp.debugger.pinVariable';

/**
 * What a hover at `column` (0-based) of `line` reads, and the span it covers. The token kind decides whether the
 * base is a variable (`MID = 1` is one, `X = MID(…)` is not); an index that is a single name is read as a variable
 * only when it is not a keyword.
 */
export function hoverPlanAt(
  line: string,
  tokens: LineToken[],
  column: number,
): { plan: HoverPlan; start: number; end: number } | null {
  const found = hoverTargetAt(line, tokens, column);
  if (!found) return null;
  const { target, start, end } = found;
  return { plan: hoverReadPlan(target.name, target.indexText, isQspKeyword, target.fields), start, end };
}

/**
 * Hover values of QSP variables: the token under the cursor (by the model's tokenization: `variable` and
 * `identifier` tokens of QSP code; in a description, those inside `<<…>>`) is read with the engine's
 * `readVariable*`, which never runs engine code.
 * A Pin link adds the variable to the watch list.
 */
export function registerQspHover(monaco: typeof Monaco): void {
  monaco.editor.registerCommand(PIN_COMMAND, (_accessor, name: unknown) => {
    if (typeof name === 'string') watchActions.add(name);
  });

  for (const languageId of ['qsp', 'qsp-description']) {
    monaco.languages.registerHoverProvider(languageId, {
      provideHover(model, position) {
        const line = model.getLineContent(position.lineNumber);
        const found = hoverPlanAt(line, qspLineTokens(model, position.lineNumber, languageId), position.column - 1);
        if (!found) return null;
        const { plan, start, end } = found;
        const { lines, pinName } = readHover(plan);
        if (lines.length === 0) return null;
        const body = hoverCodeBlock(lines);
        const pin = pinName
          ? `\n\n[Pin](command:${PIN_COMMAND}?${encodeURIComponent(JSON.stringify([pinName]))} "Add to the watch list")`
          : '';
        return {
          range: new monaco.Range(position.lineNumber, start + 1, position.lineNumber, end + 1),
          contents: [{ value: body + pin, isTrusted: { enabledCommands: [PIN_COMMAND] } }],
        };
      },
    });
  }
}

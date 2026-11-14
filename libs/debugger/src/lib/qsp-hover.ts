import type * as Monaco from 'monaco-editor';
import { hoverCodeBlock, hoverReadPlan, readHover, watchActions } from '@qspider/game-state';
import { isQspKeyword } from './qsp-language';
import { hoverTargetAt, qspLineTokens } from './qsp-tokens';

const PIN_COMMAND = 'qsp.debugger.pinVariable';

/**
 * Hover values of QSP variables: the token under the cursor (by the model's tokenization: `variable` tokens, and
 * identifiers that are not keywords) is read with the engine's `readVariable*`, which never runs engine code.
 * A Pin link adds the variable to the watch list.
 */
export function registerQspHover(monaco: typeof Monaco): void {
  monaco.editor.registerCommand(PIN_COMMAND, (_accessor, name: unknown) => {
    if (typeof name === 'string') watchActions.add(name);
  });

  monaco.languages.registerHoverProvider('qsp', {
    provideHover(model, position) {
      const line = model.getLineContent(position.lineNumber);
      const found = hoverTargetAt(line, qspLineTokens(model, position.lineNumber, 'qsp'), position.column - 1);
      if (!found) return null;
      const { target, start, end } = found;
      const plan = hoverReadPlan(target.name, target.indexText, isQspKeyword, target.fields);
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

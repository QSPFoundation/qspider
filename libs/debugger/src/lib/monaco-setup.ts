import { loader } from '@monaco-editor/react';
// The editor core with its contributions but without the TS/JSON/CSS/HTML language services (and their workers).
// @ts-expect-error The editor core ships no typings; it is cast to the public API below.
import * as editorCore from 'monaco-editor/esm/vs/editor/edcore.main';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// HTML highlighting for the Description tab: the tokenizer only (it loads html.js on first use), no HTML worker.
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution';
import type * as Monaco from 'monaco-editor';
import { registerQspLanguage } from './qsp-language';

export const monaco = editorCore as unknown as typeof Monaco;

// Only the base editor worker is bundled: QSP has no language service of its own.
globalThis.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

// Use the bundled editor instead of the CDN copy that @monaco-editor/react loads by default.
loader.config({ monaco });

registerQspLanguage(monaco);

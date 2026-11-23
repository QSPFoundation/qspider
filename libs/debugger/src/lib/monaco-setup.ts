import { loader } from '@monaco-editor/react';
// The editor API with all editor features, but without the bundled languages and the TS/JSON/CSS/HTML
// language services (and their workers): the custom-bundle entry points monaco-editor documents since 0.56.
import * as monaco from 'monaco-editor/editor';
import 'monaco-editor/features/register.all';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import { registerQspLanguage } from './qsp-language';
import { registerQspHover } from './qsp-hover';
import { registerQspDescriptionLanguage } from './qsp-description-language';

export { monaco };

// Only the base editor worker is bundled: QSP has no language service of its own.
globalThis.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

// Use the bundled editor instead of the CDN copy that @monaco-editor/react loads by default.
loader.config({ monaco });

registerQspLanguage(monaco);
registerQspDescriptionLanguage(monaco);
registerQspHover(monaco);

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
// eslint-disable-next-line @nx/enforce-module-boundaries
import baseConfig from '../../eslint.config.js';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// E2E conventions (apps/player-e2e/README.md, "Rules"). The patterns below are anchored to this directory with
// `basePath`, so they match whichever directory ESLint runs from (`nx lint` here, lint-staged at the repo root).
const FRAMEWORKS = ['@playwright/test', 'playwright*', 'webdriverio', '@wdio/*'];
const TARGETS = {
  group: ['**/targets/**'],
  message: 'Shared code must not depend on a target; go through OperatePlayer.',
};
const NO_FRAMEWORKS = { group: FRAMEWORKS, message: 'Use Serenity/JS; runner and driver APIs belong in targets/.' };
const NO_ENSURE = {
  name: '@serenity-js/assertions',
  importNames: ['Ensure'],
  message: 'Ensure is used only in screenplay/support/; checks go through seeEventually.',
};
// Serenity's isPresent() throws on desktop instead of answering false (support/presence.ts).
const IS_PRESENT_MESSAGE = 'Use the helpers in screenplay/support/presence.ts (PresenceOf, waitUntilPresent, …).';
const NO_IS_PRESENT = [
  { name: '@serenity-js/assertions', importNames: ['isPresent'], message: IS_PRESENT_MESSAGE },
  { name: '@serenity-js/web', importNames: ['isPresent'], message: IS_PRESENT_MESSAGE },
];
const NO_BY = {
  name: '@serenity-js/web',
  importNames: ['By'],
  message: 'Selectors live only in elements.ts (and support/).',
};
// In-page script runs only in support/page-script.ts, as named read-only probes (no arbitrary code).
const PAGE_SCRIPT_MESSAGE =
  'Page scripts live only in screenplay/support/page-script.ts; use its named probes and recorders.';
const NO_PAGE_SCRIPT = {
  name: '@serenity-js/web',
  importNames: ['ExecuteScript', 'LastScriptExecution'],
  message: PAGE_SCRIPT_MESSAGE,
};
// scriptResult runs any function in the page, so only the probe files in screenplay/support/ may import it.
const NO_SCRIPT_RESULT = {
  group: ['**/page-script'],
  importNames: ['scriptResult'],
  message: 'scriptResult runs arbitrary page code: only the probe files in screenplay/support/ may import it.',
};
const NO_EXECUTE_SCRIPT_CALL = {
  selector: "CallExpression[callee.property.name='executeScript']",
  message: PAGE_SCRIPT_MESSAGE,
};
// Tasks may compose only the fail-fast guards in common/checks.ts (e.g. SeeGameStarted), not an area's checks.
const NO_AREA_CHECKS = {
  regex: '(^|/)(?!common/)[^/]+/checks$',
  message: 'Tasks may compose only the fail-fast guards in common/checks.ts; scenarios call area checks.',
};
const restrictImports = ({ paths = [], patterns = [] }) => ({
  'no-restricted-imports': ['error', { paths, patterns }],
});

const NO_SLEEP = {
  selector: "CallExpression[callee.object.name='Wait'][callee.property.name='for']",
  message: 'No fixed sleeps: wait for a condition (waitUntilPresent, Wait.until, seeEventually).',
};
// no-restricted-imports does not see import(), so dynamic imports would bypass every import ban above.
const NO_DYNAMIC_IMPORT = {
  selector: 'ImportExpression',
  message:
    'No dynamic import(): it bypasses the import rules. Only screenplay/support/scenario.ts loads a target shim this way.',
};
const MARKER = /\[data-qsp|\[data-qa|\[role=/.source;
const BY_CSS = "CallExpression[callee.object.name='By'][callee.property.name='css']";
const UNMARKED_SELECTOR_MESSAGE =
  'By.css selectors target only [data-qsp…], [data-qa…] or [role=…], never classes, text or layout.';
const UNMARKED_SELECTORS = [
  { selector: `${BY_CSS} > Literal.arguments[value!=/${MARKER}/]`, message: UNMARKED_SELECTOR_MESSAGE },
  {
    selector: `${BY_CSS} > TemplateLiteral.arguments:not(:has(TemplateElement[value.raw=/${MARKER}/]))`,
    message: UNMARKED_SELECTOR_MESSAGE,
  },
];

// Later entries override earlier ones for the same rule, so each entry lists the full set for its files.
const conventions = [
  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.lib.json', './tsconfig.desktop.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.mts', '**/*.js'],
    rules: {
      ...restrictImports({ paths: [NO_ENSURE, NO_BY, NO_PAGE_SCRIPT, ...NO_IS_PRESENT], patterns: [NO_SCRIPT_RESULT] }),
      'no-restricted-syntax': ['error', NO_SLEEP, NO_DYNAMIC_IMPORT, NO_EXECUTE_SCRIPT_CALL],
    },
  },
  {
    files: ['screenplay/**/*.ts'],
    rules: {
      ...restrictImports({
        paths: [NO_ENSURE, NO_BY, NO_PAGE_SCRIPT, ...NO_IS_PRESENT],
        patterns: [TARGETS, NO_FRAMEWORKS, NO_SCRIPT_RESULT],
      }),
      'max-lines': ['error', 150],
    },
  },
  {
    files: ['screenplay/**/tasks.ts'],
    rules: restrictImports({
      paths: [NO_ENSURE, NO_BY, NO_PAGE_SCRIPT, ...NO_IS_PRESENT],
      patterns: [TARGETS, NO_FRAMEWORKS, NO_AREA_CHECKS, NO_SCRIPT_RESULT],
    }),
  },
  {
    files: ['screenplay/**/elements.ts'],
    rules: {
      ...restrictImports({
        paths: [NO_ENSURE, NO_PAGE_SCRIPT, ...NO_IS_PRESENT],
        patterns: [TARGETS, NO_FRAMEWORKS, NO_SCRIPT_RESULT],
      }),
      'no-restricted-syntax': ['error', NO_SLEEP, NO_DYNAMIC_IMPORT, NO_EXECUTE_SCRIPT_CALL, ...UNMARKED_SELECTORS],
    },
  },
  {
    files: ['screenplay/**/checks.ts'],
    rules: restrictImports({
      paths: [NO_ENSURE, NO_BY, NO_PAGE_SCRIPT, ...NO_IS_PRESENT],
      patterns: [TARGETS, NO_FRAMEWORKS, NO_SCRIPT_RESULT],
    }),
  },
  {
    files: ['screenplay/support/**/*.ts'],
    rules: restrictImports({ paths: [NO_PAGE_SCRIPT], patterns: [TARGETS, NO_FRAMEWORKS] }),
  },
  {
    // The one home of in-page script (ExecuteScript, LastScriptExecution).
    files: ['screenplay/support/page-script.ts'],
    rules: {
      ...restrictImports({ patterns: [TARGETS, NO_FRAMEWORKS] }),
      'no-restricted-syntax': ['error', NO_SLEEP, NO_DYNAMIC_IMPORT],
    },
  },
  {
    // Loads targets/<target>/scenario.ts at runtime by design: the one bridge from shared code to the runners.
    files: ['screenplay/support/scenario.ts'],
    rules: {
      ...restrictImports({ paths: [NO_PAGE_SCRIPT], patterns: [NO_FRAMEWORKS] }),
      'no-restricted-syntax': ['error', NO_SLEEP, NO_EXECUTE_SCRIPT_CALL],
    },
  },
  {
    files: ['scenarios/**/*.ts'],
    rules: restrictImports({
      paths: [NO_ENSURE, NO_BY, NO_PAGE_SCRIPT, ...NO_IS_PRESENT],
      patterns: [
        TARGETS,
        NO_SCRIPT_RESULT,
        {
          group: [...FRAMEWORKS, '@serenity-js/playwright*', '@serenity-js/webdriverio', '@serenity-js/web'],
          message: 'Scenarios use only tasks, checks and constants from screenplay/ and fixtures/.',
        },
      ],
    }),
  },
].map((config) => ({ ...config, basePath: __dirname }));

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
  ...conventions,
  ...compat.config({ parser: 'jsonc-eslint-parser' }).map((config) => ({
    ...config,
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': 'error',
    },
  })),
];

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

// E2E conventions (apps/player-e2e/README.md, "Rules"). `nx lint` runs ESLint from the repo root with this
// file as an override config, so the patterns below are anchored to this directory with `basePath`.
const FRAMEWORKS = ['@playwright/test', 'playwright*', 'webdriverio', '@wdio/*'];
const TARGETS = {
  group: ['**/targets/**'],
  message: 'Shared code must not depend on a target; go through OperatePlayer.',
};
const NO_FRAMEWORKS = { group: FRAMEWORKS, message: 'Use Serenity/JS; runner and driver APIs belong in targets/.' };
const NO_ENSURE = {
  name: '@serenity-js/assertions',
  importNames: ['Ensure'],
  message: 'Ensure is used only in checks.ts (through seeEventually) and support/; tasks compose checks instead.',
};
const NO_BY = {
  name: '@serenity-js/web',
  importNames: ['By'],
  message: 'Selectors live only in elements.ts (and support/).',
};
const restrictImports = ({ paths = [], patterns = [] }) => ({
  'no-restricted-imports': ['error', { paths, patterns }],
});

const NO_SLEEP = {
  selector: "CallExpression[callee.object.name='Wait'][callee.property.name='for']",
  message: 'No fixed sleeps: wait for a condition (waitUntilPresent, Wait.until, seeEventually).',
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
      ...restrictImports({ paths: [NO_ENSURE, NO_BY] }),
      'no-restricted-syntax': ['error', NO_SLEEP],
    },
  },
  {
    files: ['screenplay/**/*.ts'],
    rules: {
      ...restrictImports({ paths: [NO_ENSURE, NO_BY], patterns: [TARGETS, NO_FRAMEWORKS] }),
      'max-lines': ['error', 150],
    },
  },
  {
    files: ['screenplay/**/elements.ts'],
    rules: {
      ...restrictImports({ paths: [NO_ENSURE], patterns: [TARGETS, NO_FRAMEWORKS] }),
      'no-restricted-syntax': ['error', NO_SLEEP, ...UNMARKED_SELECTORS],
    },
  },
  {
    files: ['screenplay/**/checks.ts'],
    rules: restrictImports({ paths: [NO_BY], patterns: [TARGETS, NO_FRAMEWORKS] }),
  },
  {
    files: ['screenplay/support/**/*.ts'],
    rules: restrictImports({ patterns: [TARGETS, NO_FRAMEWORKS] }),
  },
  {
    // Loads targets/<target>/scenario.ts at runtime by design: the one bridge from shared code to the runners.
    files: ['screenplay/support/scenario.ts'],
    rules: restrictImports({ patterns: [NO_FRAMEWORKS] }),
  },
  {
    files: ['scenarios/**/*.ts'],
    rules: restrictImports({
      paths: [NO_ENSURE, NO_BY],
      patterns: [
        TARGETS,
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

import nxEslintPlugin from '@nx/eslint-plugin';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// eslint-plugin-react-hooks v7 added React Compiler rules to its recommended preset as errors.
// Report them as warnings until the existing violations are reviewed.
export const reactCompilerRules = Object.fromEntries(
  [
    'static-components',
    'use-memo',
    'preserve-manual-memoization',
    'immutability',
    'globals',
    'refs',
    'set-state-in-effect',
    'error-boundaries',
    'purity',
    'set-state-in-render',
    'config',
    'gating',
  ].map((rule) => [`react-hooks/${rule}`, 'warn']),
);

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { plugins: { '@nx': nxEslintPlugin } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
];

import path from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// Lints snippets the way `nx lint player-e2e` does: from the repo root, with the project config.
// Paths are real files, so type-aware rules find them in the project's tsconfigs; the snippet replaces their content.
const appDir = import.meta.dirname;
const repoRoot = path.resolve(appDir, '../..');
const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: path.join(appDir, 'eslint.config.js') });

const ruleIds = async (code: string, file: string) => {
  const [result] = await eslint.lintText(code, { filePath: path.join(appDir, file) });
  return result.messages.map((m) => m.ruleId ?? `fatal: ${m.message}`);
};

describe('player-e2e lint rules', () => {
  it('bans framework imports in scenarios', async () => {
    const code = `import { test } from '@playwright/test';\nexport const t = test;\n`;
    expect(await ruleIds(code, 'scenarios/core-flow.scenario.ts')).toContain('no-restricted-imports');
  });

  it('bans targets imports in scenarios', async () => {
    const code = `import { scenario } from '../targets/web/scenario';\nexport const s = scenario;\n`;
    expect(await ruleIds(code, 'scenarios/core-flow.scenario.ts')).toContain('no-restricted-imports');
  });

  it('bans targets and framework imports in screenplay', async () => {
    const code = `import { Cast } from '../../targets/web/cast';\nimport { browser } from '@wdio/globals';\nexport const c = [Cast, browser];\n`;
    const ids = await ruleIds(code, 'screenplay/game/tasks.ts');
    expect(ids.filter((id) => id === 'no-restricted-imports')).toHaveLength(2);
  });

  it('bans Ensure outside checks.ts and support/', async () => {
    const code = `import { Ensure, equals } from '@serenity-js/assertions';\nexport const T = () => Ensure.that(1, equals(1));\n`;
    expect(await ruleIds(code, 'screenplay/game/tasks.ts')).toContain('no-restricted-imports');
  });

  it('allows Ensure in checks.ts', async () => {
    const code = `import { Ensure, equals } from '@serenity-js/assertions';\nexport const SeeOne = () => Ensure.that(1, equals(1));\n`;
    expect(await ruleIds(code, 'screenplay/game/checks.ts')).toEqual([]);
  });

  it('bans By outside elements.ts and support/', async () => {
    const code = `import { By, PageElement } from '@serenity-js/web';\nexport const X = PageElement.located(By.css('[data-qsp="x"]'));\n`;
    expect(await ruleIds(code, 'screenplay/game/tasks.ts')).toContain('no-restricted-imports');
  });

  it('bans By.css selectors in elements.ts that use neither a data-qsp/data-qa marker nor a role', async () => {
    const code = `import { By, PageElement } from '@serenity-js/web';\nexport const X = PageElement.located(By.css('.qsp-button'));\n`;
    expect(await ruleIds(code, 'screenplay/game/elements.ts')).toContain('no-restricted-syntax');
  });

  it('bans template-literal By.css selectors in elements.ts without a marker', async () => {
    const code = `import { By, PageElement } from '@serenity-js/web';\nexport const X = (n: number) => PageElement.located(By.css(\`.slot-\${n}\`));\n`;
    expect(await ruleIds(code, 'screenplay/saves/elements.ts')).toContain('no-restricted-syntax');
  });

  it('bans Wait.for everywhere', async () => {
    const code = `import { Duration, Wait } from '@serenity-js/core';\nexport const Pause = () => Wait.for(Duration.ofSeconds(1));\n`;
    expect(await ruleIds(code, 'targets/web/cast.ts')).toContain('no-restricted-syntax');
  });

  it('caps screenplay files at 150 lines', async () => {
    const code = `export const a = 1;\n`.repeat(151);
    expect(await ruleIds(code, 'screenplay/game/checks.ts')).toContain('max-lines');
  });

  it('flags an attemptsTo that is not awaited', async () => {
    const code = [
      `import { OpenFixture } from '../screenplay/game/tasks';`,
      `import { scenario } from '../screenplay/support/scenario';`,
      `scenario('x', async (player) => {`,
      `  player.attemptsTo(OpenFixture());`,
      `});`,
      ``,
    ].join('\n');
    expect(await ruleIds(code, 'scenarios/core-flow.scenario.ts')).toContain('@typescript-eslint/no-floating-promises');
  });

  it('flags a promise passed where a void callback is expected', async () => {
    const code = `export const run = (f: () => Promise<void>) => [1].forEach(f);\n`;
    expect(await ruleIds(code, 'screenplay/support/visible.ts')).toContain('@typescript-eslint/no-misused-promises');
  });

  it('accepts a clean elements.ts', async () => {
    const code = `import { By, PageElement } from '@serenity-js/web';\nexport const MainText = PageElement.located(By.css('[data-qsp="main-content"]'));\n`;
    expect(await ruleIds(code, 'screenplay/game/elements.ts')).toEqual([]);
  });

  it('bans dynamic imports of targets in screenplay', async () => {
    const code = `export const load = async () => import('../../targets/web/scenario');\n`;
    expect(await ruleIds(code, 'screenplay/game/tasks.ts')).toContain('no-restricted-syntax');
  });

  it('bans dynamic framework imports in scenarios', async () => {
    const code = `export const load = async () => import('@playwright/test');\n`;
    expect(await ruleIds(code, 'scenarios/core-flow.scenario.ts')).toContain('no-restricted-syntax');
  });

  it('lets support/scenario.ts load the target shims with a dynamic import', async () => {
    const code = [
      `const target = process.env['QSPIDER_E2E_TARGET'] ?? '';`,
      'const shim = (await import(`../../targets/${target}/scenario.ts`)) as { scenario: unknown };',
      `export const scenario = shim.scenario;`,
      ``,
    ].join('\n');
    expect(await ruleIds(code, 'screenplay/support/scenario.ts')).toEqual([]);
  });
});

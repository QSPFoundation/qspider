import path from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// Lints snippets the way `nx lint player-e2e` does: from the repo root, with the project config.
// Paths are real files, so type-aware rules find them in the project's tsconfigs; the snippet replaces their content.
// These tests lint in-memory snippets at real file paths. With CI=true, typescript-eslint infers a
// "single run" and builds its program from the files on disk, which then crashes TypeScript in
// type-aware rules. Opt out of that inference here; `nx lint` keeps it.
process.env['TSESTREE_SINGLE_RUN'] = 'false';

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

  it('bans Ensure in tasks.ts', async () => {
    const code = `import { Ensure, equals } from '@serenity-js/assertions';\nexport const T = () => Ensure.that(1, equals(1));\n`;
    expect(await ruleIds(code, 'screenplay/game/tasks.ts')).toContain('no-restricted-imports');
  });

  it('bans raw Ensure in checks.ts: checks go through seeEventually', async () => {
    const code = `import { Ensure, equals } from '@serenity-js/assertions';\nexport const SeeOne = () => Ensure.that(1, equals(1));\n`;
    expect(await ruleIds(code, 'screenplay/game/checks.ts')).toContain('no-restricted-imports');
  });

  it('allows Ensure in support/', async () => {
    const code = `import { Ensure, equals } from '@serenity-js/assertions';\nexport const SeeOne = () => Ensure.that(1, equals(1));\n`;
    expect(await ruleIds(code, 'screenplay/support/visible.ts')).toEqual([]);
  });

  it('bans isPresent from @serenity-js/assertions and @serenity-js/web in tasks.ts', async () => {
    const code = `import { isPresent } from '@serenity-js/assertions';\nimport { isPresent as p } from '@serenity-js/web';\nexport const x = [isPresent, p];\n`;
    const ids = await ruleIds(code, 'screenplay/game/tasks.ts');
    expect(ids.filter((id) => id === 'no-restricted-imports')).toHaveLength(2);
  });

  it('allows isPresent in support/', async () => {
    const code = `import { isPresent } from '@serenity-js/assertions';\nexport const x = isPresent;\n`;
    expect(await ruleIds(code, 'screenplay/support/visible.ts')).toEqual([]);
  });

  it("bans an area's checks in tasks.ts", async () => {
    const code = `import { SeeSlotEmpty } from '../saves/checks';\nexport const x = SeeSlotEmpty;\n`;
    expect(await ruleIds(code, 'screenplay/game/tasks.ts')).toContain('no-restricted-imports');
  });

  it('lets tasks.ts compose the guards in common/checks.ts', async () => {
    const code = `import { SeeGameStarted } from '../common/checks';\nexport const x = SeeGameStarted;\n`;
    expect(await ruleIds(code, 'screenplay/game/tasks.ts')).toEqual([]);
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

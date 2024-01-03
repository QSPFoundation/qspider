import type { ExecutorContext } from '@nx/devkit';
import { start } from '@docusaurus/core/lib';
import { ServeExecutorSchema } from './schema';
import path from 'node:path';

export default async function* runExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext,
): AsyncGenerator<{ success: boolean; baseUrl: string }> {
  const projectRoot = path.join(
    context.root,
    context.projectsConfigurations?.projects[context.projectName ?? '']?.root ?? '',
  );
  const port = options.port.toString();

  await start(projectRoot, {
    port,
    host: options.host,
    open: options.open,
  });

  yield {
    baseUrl: `http://${options.host}:${port}`,
    success: true,
  };

  // This Promise intentionally never resolves, leaving the process running
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await new Promise<{ success: boolean }>(() => {});
}

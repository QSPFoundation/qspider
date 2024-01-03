import type { ExecutorContext } from '@nx/devkit';
import { BuildExecutorSchema } from './schema';
import path from 'node:path';
import { build } from '@docusaurus/core/lib';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const projectRoot = path.join(
    context.root,
    context.projectsConfigurations?.projects[context.projectName ?? '']?.root ?? '',
  );

  try {
    await build(projectRoot, {
      outDir: path.join(context.root, options.outputPath),
      minify: options.minify,
    });
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}

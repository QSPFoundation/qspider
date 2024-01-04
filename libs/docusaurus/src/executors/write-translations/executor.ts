import { ExecutorContext } from '@nx/devkit';
import { WriteTranslationsExecutorSchema } from './schema';
import path from 'node:path';
import { writeTranslations } from '@docusaurus/core/lib';

export default async function runExecutor(
  options: WriteTranslationsExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const projectRoot = path.join(
    context.root,
    context.projectsConfigurations?.projects[context.projectName ?? '']?.root ?? '',
  );
  try {
    await writeTranslations(projectRoot, {
      locale: options.locale,
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

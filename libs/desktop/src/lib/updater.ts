import { ask } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';
import { check } from '@tauri-apps/plugin-updater';

export async function checkForUpdates(): Promise<void> {
  // E2E builds (build-desktop-e2e) must not hit the network or show an update prompt.
  // Vite inlines the value at build time; release builds never set it, so this branch
  // is dead code there and gets dropped.
  if (import.meta.env.VITE_QSPIDER_E2E === 'true') {
    return;
  }
  try {
    const update = await check();
    if (!update) {
      return;
    }
    const confirmed = await ask(
      `A new version ${update.version} is available.\n\n${update.body ?? ''}\n\nInstall now?`,
      { title: 'Update available' },
    );
    if (!confirmed) {
      return;
    }
    await update.downloadAndInstall();
    await relaunch();
  } catch (err) {
    console.error('Update check failed', err);
  }
}

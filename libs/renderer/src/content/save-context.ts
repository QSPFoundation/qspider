import type { SaveContext } from '@qspider/game-state';

export function getSaveContext(target: HTMLElement): SaveContext | null {
  const saveRoot = target.closest<HTMLElement>('[data-qsp-save]');
  if (!saveRoot) {
    console.error('qsp-save-command used on element outside of save tag');
    return null;
  }
  const slot_index = 'qspSaveIndex' in saveRoot.dataset ? parseInt(saveRoot.dataset['qspSaveIndex'] ?? '-1', 0) : -1;
  const save_path = saveRoot.dataset['qspSavePath'] ?? '';
  return {
    slot_index,
    save_path,
  };
}

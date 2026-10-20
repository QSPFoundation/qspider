import { getMatches } from '@tauri-apps/plugin-cli';
import { open } from '@tauri-apps/plugin-dialog';
import { getCurrentWebview } from '@tauri-apps/api/webview';

export { extname } from '@tauri-apps/api/path';

export async function getLaunchFilePath(): Promise<string | undefined> {
  const { args } = await getMatches();
  const value = args['file']?.value || args['filePath']?.value;
  return typeof value === 'string' && value ? value : undefined;
}

export async function pickGameFile(): Promise<string | null> {
  return open({
    multiple: false,
    filters: [
      {
        name: 'Qsp files',
        extensions: ['qsp', 'qsps', 'gam', 'aqsp', 'zip', 'rar', '7z'],
      },
    ],
  });
}

export interface FileDropHandlers {
  onHover(path: string): void;
  onDrop(path: string): void;
  onCancel(): void;
}

export async function onFileDrop(handlers: FileDropHandlers): Promise<() => void> {
  return getCurrentWebview().onDragDropEvent((event) => {
    const payload = event.payload;
    switch (payload.type) {
      case 'enter':
        handlers.onHover(payload.paths[0]);
        break;
      case 'drop':
        handlers.onDrop(payload.paths[0]);
        break;
      case 'leave':
        handlers.onCancel();
        break;
    }
  });
}

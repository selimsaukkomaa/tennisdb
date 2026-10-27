// Saving and opening backup files. Web: a download and a file picker. iOS: a WKWebView ignores
// download links, so the file is written to the app's cache and handed to the share sheet
// (Save to Files, AirDrop, Mail...). The file picker works in both.
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNative } from './native';

export async function saveTextFile(filename: string, text: string): Promise<void> {
  if (isNative()) {
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: text,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: filename, url: uri, dialogTitle: 'Save the stringing log' });
    return;
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Opens a file picker and resolves with the chosen file's text, or null if cancelled. */
export function pickTextFile(accept = 'application/json,.json'): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      resolve(file ? await file.text() : null);
    });
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

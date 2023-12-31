import { WAIT_BUILD } from './constants.ts';

export async function watcher(
  watchDir: string,
  onChanges: (files: string[]) => Promise<unknown>,
) {
  const watcher = Deno.watchFs(watchDir);
  let timer = 0;
  let files: string[] = [];
  for await (const event of watcher) {
    files.push(...event.paths);
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const changedFiles = files.filter((file, index) => {
        return files.indexOf(file) === index;
      });
      files = [];
      if (changedFiles.length <= 0) {
        timer = 0;
        return;
      }

      onChanges(changedFiles).finally(() => {
        timer = 0;
      });
    }, WAIT_BUILD);
  }
}

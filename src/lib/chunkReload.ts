/**
 * Recovery for code-split pages whose files no longer exist on the server: after a deploy
 * (new chunk hashes) or when the Vite dev server rebuilt its dependency cache while a tab was
 * open. One full reload fetches the current files. A short guard prevents reload loops.
 */
const KEY = 'bm.chunkReloadAt';
const WINDOW_MS = 10_000;

const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Outdated Optimize Dep/i;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_ERROR.test(message);
}

/** Reloads once; returns false if a reload just happened (then show the error instead). */
export function reloadForFreshChunks(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: still try one reload.
  }
  window.location.reload();
  return true;
}

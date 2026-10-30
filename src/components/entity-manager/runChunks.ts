import type { ApplyResult } from './types';

export interface ChunkRunResult<R> extends ApplyResult {
  results: R[];
  error: unknown;
}

export async function runChunks<T, R>(
  items: readonly T[],
  apply: (chunk: T[]) => Promise<R>,
  size = 500,
  onProgress?: (done: number, total: number) => void,
): Promise<ChunkRunResult<R>> {
  const total = items.length;
  const results: R[] = [];
  let saved = 0;

  for (let start = 0; start < total; start += size) {
    const chunk = items.slice(start, start + size);
    onProgress?.(saved, total);
    try {
      results.push(await apply(chunk));
    } catch (error) {
      return {
        saved,
        total,
        failed: total - saved,
        reason: null,
        results,
        error,
      };
    }
    saved += chunk.length;
  }

  onProgress?.(saved, total);
  return { saved, total, failed: 0, reason: null, results, error: null };
}

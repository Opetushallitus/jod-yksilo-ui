const maxQueryLength = 4096;
const queryParamOverhead = 5; // uri=...&

/**
 * Combines objects referencing a dto with the actual dto.
 *
 * @param objects Collection of objects to combine with.
 * @param key Property accessor for the reference (uri).
 * @param combiner Function to combine the object with the dto.
 * @param signal Abort signal.
 * @param get Function to fetch the dtos.
 * @returns An array of objects combined with Dto, excluding objects for which Dto was not found.
 *
 * Note: If the number of Dtos to fetch is large, the requests are split into multiple chunks to avoid exceeding the maximum query length.
 */

export async function combinerImpl<T, R, D extends { uri: string }>(
  objects: Iterable<T> | undefined,
  key: (o: T) => string,
  combiner: (object: T, dto: D) => R,
  get: (uris: string[], signal?: AbortSignal) => Promise<D[]>,
  signal?: AbortSignal,
) {
  if (!objects) {
    return [];
  }
  const result: R[] = [];
  const seen = new Map<string, D | undefined>();
  const chunks: string[][] = [];

  let len = maxQueryLength;
  for (const obj of objects) {
    const uri = key(obj);
    if (seen.has(uri)) {
      continue;
    }
    seen.set(uri, undefined);
    if (len + uri.length + queryParamOverhead > maxQueryLength) {
      chunks.push([uri]);
      len = uri.length + queryParamOverhead;
    } else {
      chunks[chunks.length - 1].push(uri);
      len += uri.length + queryParamOverhead;
    }
  }

  if (chunks.length > 0) {
    (await Promise.all(chunks.map((chunk) => get(chunk, signal))))
      .flatMap((result) => result)
      .forEach((dto) => seen.set(dto.uri, dto));
  }

  for (const obj of objects) {
    const ammatti = seen.get(key(obj));
    if (ammatti) result.push(combiner(obj, ammatti));
  }

  return result;
}

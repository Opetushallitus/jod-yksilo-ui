import { client } from './client';
import { combinerImpl } from './combinerImpl';
import { components } from './schema';

export type AmmattiDto = components['schemas']['AmmattiDto'];

export const ammatit = {
  /**
   * Combines objects referencing ammatti with ammatit.
   *
   * @param objects Collection of objects to combine with ammatit.
   * @param key Property accessor for the ammatti uri.
   * @param combiner Function to combine the object with the ammatti.
   * @param signal Abort signal.
   * @returns An array of objects combined with Ammatti, excluding objects for which Ammatti was not found.
   *
   * Note: If the number of Ammatti to fetch is large, the requests are split into multiple chunks to avoid exceeding the maximum query length.
   */
  combine: async <T, R>(
    objects: Iterable<T> | undefined,
    key: (o: T) => string,
    combiner: (object: T, ammatti: AmmattiDto) => R,
    signal?: AbortSignal,
  ) => {
    return combinerImpl(
      objects,
      key,
      combiner,
      async (chunk, signal) => {
        const result = await client.GET('/api/ammatit', {
          signal,
          params: { query: { uri: chunk, sivu: 0, koko: chunk.length } },
        });
        return result.data?.sisalto ?? [];
      },
      signal,
    );
  },

  find: async (uris?: Iterable<string>, signal?: AbortSignal) => {
    if (!uris) {
      return [];
    }
    return await ammatit.combine(
      uris,
      (uri) => uri,
      (_, ammatti) => ammatti,
      signal,
    );
  },

  get: async (uri: string, signal?: AbortSignal) => {
    return (await ammatit.find([uri], signal)).at(0);
  },
};

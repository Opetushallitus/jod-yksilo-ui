import { client } from './client';
import { components } from './schema';

export type OsaaminenDto = components['schemas']['OsaaminenDto'];
const maxQueryLength = 4096;
const queryParamOverhead = 5; // uri=...&

export const osaamiset = {
  /**
   * Combines objects referencing osaamiset with osaamiset.
   *
   * @param objects Collection of objects to combine with osaamiset.
   * @param key Property accessor for the osaaminen uri.
   * @param combiner Function to combine the object with the osaaminen.
   * @param signal Abort signal.
   * @returns An array of objects combined with osaaminen, excluding objects for which osaaminen was not found.
   *
   * Note: If the number of osaaminen to fetch is large, the requests are split into multiple chunks to avoid exceeding the maximum query length.
   */
  combine: async <T, R>(
    objects: Iterable<T> | undefined,
    key: (o: T) => string,
    combiner: (object: T, osaaminen: OsaaminenDto) => R,
    signal?: AbortSignal,
  ) => {
    if (!objects) {
      return [];
    }
    const chunks: string[][] = [];
    const result: R[] = [];
    const seen = new Map<string, OsaaminenDto | undefined>();

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
      (
        await Promise.all(
          chunks.map((chunk) =>
            client.GET('/api/osaamiset', {
              signal,
              params: { query: { uri: chunk, sivu: 0, koko: chunk.length } },
            }),
          ),
        )
      )
        .flatMap((result) => result.data?.sisalto ?? [])
        .forEach((osaaminen) => seen.set(osaaminen.uri, osaaminen));
    }

    for (const obj of objects) {
      const osaaminen = seen.get(key(obj));
      if (osaaminen) result.push(combiner(obj, osaaminen));
    }

    return result;
  },

  find: async (uris?: Iterable<string>, signal?: AbortSignal) => {
    if (!uris) {
      return [];
    }
    return await osaamiset.combine(
      uris,
      (uri) => uri,
      (_, osaaminen) => osaaminen,
      signal,
    );
  },

  get: async (uri: string, signal?: AbortSignal) => {
    return (await osaamiset.find([uri], signal)).at(0);
  },
};

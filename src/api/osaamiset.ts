import { ESCO_OCCUPATION_PREFIX } from '@/constants';
import { client } from './client';
import { combinerImpl } from './combinerImpl';
import { components } from './schema';

export type OsaaminenDto = components['schemas']['OsaaminenDto'];

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
    return combinerImpl(
      objects,
      key,
      combiner,
      async (chunk, signal) => {
        const skills = chunk.filter((uri) => !uri.startsWith(ESCO_OCCUPATION_PREFIX));
        const skillsResult = await client.GET('/api/osaamiset', {
          signal,
          params: { query: { uri: skills, sivu: 0, koko: skills.length } },
        });

        let occupationsResult;
        const occupations = chunk.filter((uri) => uri.startsWith(ESCO_OCCUPATION_PREFIX));
        if (occupations.length > 0) {
          occupationsResult = (
            await client.GET('/api/ammatit', {
              signal,
              params: { query: { uri: occupations, sivu: 0, koko: occupations.length } },
            })
          ).data?.sisalto.map((osaaminen) => ({
            uri: osaaminen.uri,
            nimi: osaaminen.nimi,
            kuvaus: osaaminen.kuvaus ?? {},
          }));
        }
        return [...(skillsResult.data?.sisalto ?? []), ...(occupationsResult ?? [])];
      },
      signal,
    );
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

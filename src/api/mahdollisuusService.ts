import { client } from '@/api/client';
import { TypedMahdollisuus } from '@/routes/types';

/**
 * Caches for different types of opportunities
 */
const tyomahdollisuusCache: Record<string, TypedMahdollisuus> = {};
const koulutusmahdollisuusCache: Record<string, TypedMahdollisuus> = {};

const getUsingCache = async (
  ids: string[],
  cache: Record<string, TypedMahdollisuus>,
  fetcher: (ids: string[]) => Promise<TypedMahdollisuus[]>,
): Promise<TypedMahdollisuus[]> => {
  const idsToFetch = ids.filter((id) => !cache[id]);
  let fetchedItems: TypedMahdollisuus[] = [];
  if (idsToFetch.length > 0) {
    fetchedItems = await fetcher(idsToFetch);
    for (const item of fetchedItems) {
      cache[item.id] = item;
    }
  }
  return ids.map((id) => cache[id]).filter((item): item is TypedMahdollisuus => !!item);
};

export const getTyoMahdollisuusDetails = async (ids: string[]) => {
  if (ids.length === 0) {
    return [];
  }
  const { data, error } = await client.GET('/api/tyomahdollisuudet', {
    params: {
      query: {
        id: ids,
      },
    },
  });

  if (!error) {
    return data?.sisalto ?? [];
  }

  return [];
};

export const getTypedTyoMahdollisuusDetails = async (ids: string[]): Promise<TypedMahdollisuus[]> =>
  getUsingCache(ids, tyomahdollisuusCache, async (ids: string[]) =>
    (await getTyoMahdollisuusDetails(ids)).map((mahdollisuus) => ({
      ...mahdollisuus,
      mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
    })),
  );

export const getKoulutusMahdollisuusDetails = async (ids: string[]) => {
  if (ids.length === 0) {
    return [];
  }
  const { data, error } = await client.GET('/api/koulutusmahdollisuudet', {
    params: {
      query: {
        id: ids,
      },
    },
  });

  if (!error) {
    return data?.sisalto ?? [];
  }
  return [];
};

export const getKoulutusMahdollisuusDetailsFullPage = async (ids: string[], pagesize: number) => {
  if (ids.length === 0) {
    return [];
  }
  const { data, error } = await client.GET('/api/koulutusmahdollisuudet/full', {
    params: {
      query: {
        id: ids,
        koko: pagesize,
      },
    },
  });

  if (!error) {
    return data?.sisalto ?? [];
  }
  return [];
};

export const getTypedKoulutusMahdollisuusDetails = async (ids: string[]): Promise<TypedMahdollisuus[]> =>
  getUsingCache(ids, koulutusmahdollisuusCache, async (ids: string[]) =>
    (await getKoulutusMahdollisuusDetails(ids)).map((mahdollisuus) => ({
      ...mahdollisuus,
      mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
    })),
  );

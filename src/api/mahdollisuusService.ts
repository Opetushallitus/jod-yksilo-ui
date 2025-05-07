import { client } from '@/api/client';
import { TypedMahdollisuus } from '@/routes/types';

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
  (await getTyoMahdollisuusDetails(ids)).map((mahdollisuus) => ({
    ...mahdollisuus,
    mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
  }));

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

export const getTypedKoulutusMahdollisuusDetails = async (ids: string[]): Promise<TypedMahdollisuus[]> =>
  (await getKoulutusMahdollisuusDetails(ids)).map((mahdollisuus) => ({
    ...mahdollisuus,
    mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS',
  }));

import { client } from '@/api/client';

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

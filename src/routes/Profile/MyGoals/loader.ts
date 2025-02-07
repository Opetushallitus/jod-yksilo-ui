import { client } from '@/api/client';
import { components } from '@/api/schema';
import { usePaamaaratStore } from '@/stores/usePaamaratStore';
import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const response = await client.GET('/api/profiili/paamaarat', { signal: request.signal });
  const paamaarat = response.data ?? [];
  const tyoPaamaarat = paamaarat.filter((item) => item.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS');
  const koulutusPaamarat = paamaarat.filter((item) => item.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS');

  let tyomahdollisuudetDetails: components['schemas']['TyomahdollisuusDto'][] = [];
  let koulutusMahdollisuudetDetails: components['schemas']['KoulutusmahdollisuusDto'][] = [];

  if (tyoPaamaarat.length > 0) {
    tyomahdollisuudetDetails =
      (
        await client.GET('/api/tyomahdollisuudet', {
          params: {
            query: {
              id: tyoPaamaarat.map((pm) => pm.mahdollisuusId),
            },
          },
        })
      ).data?.sisalto ?? [];
  }

  if (koulutusPaamarat.length > 0) {
    koulutusMahdollisuudetDetails =
      (
        await client.GET('/api/koulutusmahdollisuudet', {
          params: {
            query: {
              id: koulutusPaamarat.map((pm) => pm.mahdollisuusId),
            },
          },
        })
      ).data?.sisalto ?? [];
  }

  const paamaaraStore = usePaamaaratStore.getState();
  paamaaraStore.setPaamaarat(paamaarat);
  paamaaraStore.updateCategories();

  return { paamaarat, tyomahdollisuudetDetails, koulutusMahdollisuudetDetails };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

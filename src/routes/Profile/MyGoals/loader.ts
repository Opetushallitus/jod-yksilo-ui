import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import { components } from '@/api/schema';
import { TypedMahdollisuus } from '@/routes/types';
import { usePaamaaratStore } from '@/stores/usePaamaratStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const response = await client.GET('/api/profiili/paamaarat', { signal: request.signal });
  const paamaarat = response.data ?? [];
  const tyoPaamaarat = paamaarat.filter((item) => item.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS');
  const koulutusPaamarat = paamaarat.filter((item) => item.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS');

  let tyomahdollisuudetDetails: TypedMahdollisuus[] = [];
  let koulutusMahdollisuudetDetails: TypedMahdollisuus[] = [];
  const mapToIds = (pm: components['schemas']['PaamaaraDto']) => pm.mahdollisuusId;

  if (tyoPaamaarat.length > 0) {
    tyomahdollisuudetDetails = await getTypedTyoMahdollisuusDetails(tyoPaamaarat.map(mapToIds));
  }

  if (koulutusPaamarat.length > 0) {
    koulutusMahdollisuudetDetails = await getTypedKoulutusMahdollisuusDetails(koulutusPaamarat.map(mapToIds));
  }

  const mahdollisuusDetails: TypedMahdollisuus[] = [...tyomahdollisuudetDetails, ...koulutusMahdollisuudetDetails];
  const { setPaamaarat, setMahdollisuusDetails } = usePaamaaratStore.getState();
  setPaamaarat(paamaarat);
  setMahdollisuusDetails(mahdollisuusDetails);

  const { setExcludedIds, fetchSuosikit } = useSuosikitStore.getState();
  const suosikitAlreadyInPaamaarat = paamaarat.map((pm) => pm.mahdollisuusId);
  setExcludedIds(suosikitAlreadyInPaamaarat);
  await fetchSuosikit();

  return { paamaarat, tyomahdollisuudetDetails, koulutusMahdollisuudetDetails };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

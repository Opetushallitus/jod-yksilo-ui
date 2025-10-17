import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import { components } from '@/api/schema';
import { TypedMahdollisuus } from '@/routes/types';
import { usePaamaaratStore } from '@/stores/usePaamaaratStore';
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

  const ammattiryhmaNimet: Record<string, components['schemas']['LokalisoituTeksti']> = {};
  const ammattiryhmaUris = [...tyomahdollisuudetDetails, ...koulutusMahdollisuudetDetails]
    .filter((m) => m.ammattiryhma?.uri && !ammattiryhmaNimet?.[m.ammattiryhma.uri])
    .map((m) => m.ammattiryhma!.uri)
    .filter((uri): uri is string => uri !== undefined);

  if (ammattiryhmaUris.length > 0) {
    const ammattiryhmat = await ammatit.find(ammattiryhmaUris);
    ammattiryhmat.forEach((ar) => {
      ammattiryhmaNimet[ar.uri] = ar.nimi;
    });
  }

  const mahdollisuusDetails: TypedMahdollisuus[] = [...tyomahdollisuudetDetails, ...koulutusMahdollisuudetDetails];
  const { setPaamaarat, setMahdollisuusDetails } = usePaamaaratStore.getState();
  setPaamaarat(paamaarat);
  setMahdollisuusDetails(mahdollisuusDetails);

  const { setExcludedIds, fetchSuosikit } = useSuosikitStore.getState();
  const suosikitAlreadyInPaamaarat = paamaarat.map((pm) => pm.mahdollisuusId);
  setExcludedIds(suosikitAlreadyInPaamaarat);
  await fetchSuosikit();

  return { paamaarat, tyomahdollisuudetDetails, koulutusMahdollisuudetDetails, ammattiryhmaNimet };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

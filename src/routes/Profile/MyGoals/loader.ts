import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import { components } from '@/api/schema';
import { TypedMahdollisuus } from '@/routes/types';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const response = await client.GET('/api/profiili/tavoitteet', { signal: request.signal });
  const tavoitteet = response.data ?? [];
  const tyotavoitteet = tavoitteet.filter((item) => item.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS');
  const koulutusPaamarat = tavoitteet.filter((item) => item.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS');

  let tyomahdollisuudetDetails: TypedMahdollisuus[] = [];
  let koulutusMahdollisuudetDetails: TypedMahdollisuus[] = [];
  const mapToIds = (pm: components['schemas']['TavoiteDto']) => pm.mahdollisuusId;

  if (tyotavoitteet.length > 0) {
    tyomahdollisuudetDetails = await getTypedTyoMahdollisuusDetails(tyotavoitteet.map(mapToIds));
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
  const { setTavoitteet, setMahdollisuusDetails } = useTavoitteetStore.getState();
  setTavoitteet(tavoitteet);
  setMahdollisuusDetails(mahdollisuusDetails);

  const { setExcludedIds, fetchSuosikit } = useSuosikitStore.getState();
  const suosikitAlreadyInTavoitteet = tavoitteet.map((pm) => pm.mahdollisuusId);
  setExcludedIds(suosikitAlreadyInTavoitteet);
  await fetchSuosikit();

  return { tavoitteet, tyomahdollisuudetDetails, koulutusMahdollisuudetDetails, ammattiryhmaNimet };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

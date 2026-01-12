import { ammatit as ammatitService } from '@/api/ammatit';
import { client } from '@/api/client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import i18n, { LangCode } from '@/i18n/config';
import { formatDate, sortByProperty } from '@/utils';
import { getCodesetValue, mapKoulutusCodesToLabels } from '@/utils/codes/codes';
import { redirect, type LoaderFunction } from 'react-router';
import { getEducationHistoryTableRows } from '../Profile/EducationHistory/utils';
import { getFreeTimeActivitiesTableRows } from '../Profile/FreeTimeActivities/utils';
import { getWorkHistoryTableRows } from '../Profile/WorkHistory/utils';
import { arrayToIdMap, osaaminenCombiner } from './utils';

// eslint-disable-next-line sonarjs/cognitive-complexity
const loader = (async ({ request, params }) => {
  const ulkoinenJakolinkkiId = new URL(request.url).searchParams.get('token');
  if (!ulkoinenJakolinkkiId) {
    throw redirect(`/${params.lng}/404`);
  }

  const { data, response, error } = await client.GET('/api/cv/{ulkoinenJakolinkkiId}', {
    params: { path: { ulkoinenJakolinkkiId } },
    signal: request.signal,
  });

  // Data fetch error or CV has expired
  if (!data || response.status !== 200 || error) {
    throw redirect(`/${params.lng}/404`);
  }

  // Basic info
  const kotikunta = data?.kotikunta
    ? await getCodesetValue('kunta', data.kotikunta, (params.lng ?? i18n.language) as LangCode)
    : undefined;
  const voimassaAsti = data?.voimassaAsti ? formatDate(new Date(data.voimassaAsti), 'medium') : '';

  // Työpaikat
  const tyopaikkaTableRows = [];
  if (data.tyopaikat) {
    const tyopaikkaOsaamisetMap = arrayToIdMap(
      await osaamisetService.combine(
        data.tyopaikat
          .map((tyopaikka) => tyopaikka.toimenkuvat ?? [])
          .flatMap((toimenkuva) => toimenkuva.flatMap((tk) => tk.osaamiset ?? [])),
        (key) => key,
        osaaminenCombiner,
        request.signal,
      ),
    );
    const tyopaikat = data.tyopaikat.map((tp) => ({
      ...tp,
      toimenkuvat: (tp.toimenkuvat ?? []).map((tk) => ({ ...tk, osaamiset: tk.osaamiset ?? [] })),
    }));
    tyopaikkaTableRows.push(...getWorkHistoryTableRows(tyopaikat, tyopaikkaOsaamisetMap));
  }

  // Koulutukset
  const koulutusTableRows = [];
  if (data.koulutusKokonaisuudet) {
    const koulutusOsaamisetMap = arrayToIdMap(
      await osaamisetService.combine(
        data.koulutusKokonaisuudet
          .map((kokonaisuus) => kokonaisuus.koulutukset ?? [])
          .flatMap((koulutus) => koulutus.flatMap((k) => k.osaamiset ?? [])),
        (key) => key,
        osaaminenCombiner,
        request.signal,
      ),
    );
    const koulutukset = data.koulutusKokonaisuudet.map((kk) => ({
      ...kk,
      koulutukset: (kk.koulutukset ?? []).map((koulutus) => ({
        ...koulutus,
        osaamiset: koulutus.osaamiset ?? [],
      })),
    }));
    koulutusTableRows.push(...getEducationHistoryTableRows(koulutukset, koulutusOsaamisetMap));
  }

  // Vapaa-ajan toiminnot
  const toiminnotTableRows = [];
  if (data.toiminnot) {
    const vapaaAikaOsaamisetMap = arrayToIdMap(
      await osaamisetService.combine(
        data.toiminnot
          .map((toiminto) => toiminto.patevyydet ?? [])
          .flatMap((patevyys) => patevyys.flatMap((p) => p.osaamiset ?? [])),
        (key) => key,
        osaaminenCombiner,
        request.signal,
      ),
    );
    const toiminnot = data.toiminnot.map((toiminto) => ({
      ...toiminto,
      patevyydet: (toiminto.patevyydet ?? []).map((patevyys) => ({
        ...patevyys,
        osaamiset: patevyys.osaamiset ?? [],
      })),
    }));
    toiminnotTableRows.push(...getFreeTimeActivitiesTableRows(toiminnot, vapaaAikaOsaamisetMap));
  }

  // Muu osaaminen
  const muuOsaaminen = Array.isArray(data?.muuOsaaminen?.muuOsaaminen)
    ? await osaamisetService.find(data.muuOsaaminen.muuOsaaminen)
    : [];
  const muuOsaaminenVapaateksti = data?.muuOsaaminen?.vapaateksti;

  // Kiinnostukset
  const kiinnostavatOsaamiset = [];
  const kiinnostavatAmmatit = [];

  if (Array.isArray(data?.kiinnostukset?.kiinnostukset)) {
    const osaamisetUris = data.kiinnostukset.kiinnostukset.filter((uri: string) => uri.includes('skill'));
    const ammatitUris = data.kiinnostukset.kiinnostukset.filter((uri: string) => uri.includes('occupation'));
    kiinnostavatOsaamiset.push(...(await osaamisetService.find(osaamisetUris)));
    kiinnostavatAmmatit.push(...(await ammatitService.find(ammatitUris)));
  }

  const kiinnostuksetVapaateksti = data?.kiinnostukset?.vapaateksti;

  // Suokikit
  const tyomahdollisuudet = data.suosikit?.filter((s) => s.tyyppi === 'TYOMAHDOLLISUUS') ?? [];
  const koulutusmahdollisuudet = data.suosikit?.filter((s) => s.tyyppi === 'KOULUTUSMAHDOLLISUUS') ?? [];

  const tyopaikkaSuosikit =
    tyomahdollisuudet.length > 0 ? await getTypedTyoMahdollisuusDetails(tyomahdollisuudet.map((m) => m.kohdeId)) : [];
  const koulutusSuosikit =
    koulutusmahdollisuudet.length > 0
      ? await getTypedKoulutusMahdollisuusDetails(koulutusmahdollisuudet.map((m) => m.kohdeId)).then(
          mapKoulutusCodesToLabels,
        )
      : [];
  const firstSuosikkiId = data.suosikit && data.suosikit.length > 0 ? data.suosikit[0].kohdeId : null; // For opening the first suosikki card

  const ammattiryhmaUris = tyopaikkaSuosikit.map((s) => s.ammattiryhma?.uri).filter(Boolean) as string[];
  const ammattiryhmat = ammattiryhmaUris.length > 0 ? await ammatitService.find(ammattiryhmaUris) : [];
  const ammattiryhmaNimet = ammattiryhmat.reduce<Record<string, Record<string, string>>>((acc, ar) => {
    acc[ar.uri] = ar.nimi;
    return acc;
  }, {});

  // Tavoitteet
  const tavoitteetData = Array.isArray(data?.tavoitteet) ? [...data.tavoitteet].sort(sortByProperty('luotu')) : [];

  const tavoitteet = await Promise.all(
    tavoitteetData.map(async (t) => ({
      ...t,
      tavoiteDetails:
        t.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS'
          ? (await getTypedKoulutusMahdollisuusDetails([t.mahdollisuusId ?? '']))[0]
          : (await getTypedTyoMahdollisuusDetails([t.mahdollisuusId ?? '']))[0],
      suunnitelmat: t.suunnitelmat ?? [],
    })),
  );

  const firstTavoiteId = tavoitteet.length > 0 ? tavoitteet[0].id : null;

  return {
    ammattiryhmaNimet,
    data,
    firstSuosikkiId,
    firstTavoiteId,
    kiinnostavatAmmatit,
    kiinnostavatOsaamiset,
    kiinnostuksetVapaateksti,
    kotikunta,
    koulutusSuosikit,
    koulutusTableRows,
    muuOsaaminen,
    muuOsaaminenVapaateksti,
    tavoitteet,
    toiminnotTableRows,
    tyopaikkaSuosikit,
    tyopaikkaTableRows,
    voimassaAsti,
  };
}) satisfies LoaderFunction;

export type CvLoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

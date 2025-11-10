import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { getTyoMahdollisuusDetails } from '@/api/mahdollisuusService';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import i18n from '@/i18n/config';
import { usePolutStore } from '@/stores/usePolutStore';
import { removeDuplicatesByKey, sortByProperty } from '@/utils';
import type { LoaderFunction } from 'react-router';

const loader = (async ({ request, params }) => {
  const { tavoiteId, suunnitelmaId } = params;
  const polkuStore = usePolutStore.getState();

  if (!tavoiteId || !suunnitelmaId) {
    return { tavoite: null, mahdollisuus: null, vaaditutOsaamiset: [], profiiliOsaamiset: [], polku: null };
  }

  polkuStore.setPolutLoading(true);
  // Fetch polku/suunnitelma
  const { data: polkuResponse, error } = await client.GET(
    '/api/profiili/tavoitteet/{id}/suunnitelmat/{suunnitelmaId}',
    {
      params: {
        path: { id: tavoiteId, suunnitelmaId: suunnitelmaId },
      },
    },
  );

  if (!error) {
    // Denormalize vaiheet, populate osaamiset with OsaaminenDTO data
    const vaiheet = await Promise.all(
      polkuResponse?.vaiheet?.map(async (vaihe) => {
        return {
          ...vaihe,
          linkit: (vaihe.linkit ?? []).map((link) => ({ url: link })),
          osaamiset: await osaamiset.find(vaihe.osaamiset ?? [], request.signal),
        };
      }) ?? [],
    );

    polkuStore.setPolku(polkuResponse);
    polkuStore.setVaiheet(
      [...vaiheet].sort(sortByProperty('alkuPvm')).map((vaihe) => ({
        ...vaihe,
        osaamiset: [...vaihe.osaamiset].sort(sortByProperty(`nimi.${i18n.language ?? 'fi'}`)),
      })),
    );
    polkuStore.setSelectedOsaamiset(polkuResponse.osaamiset ?? []);
    polkuStore.setIgnoredOsaamiset(polkuResponse.ignoredOsaamiset ?? []);
    polkuStore.setOsaamisetFromVaiheet(vaiheet.flatMap((vaihe) => vaihe.osaamiset ?? []));
  }

  const { data: tavoitteetResponse = [] } = await client.GET('/api/profiili/tavoitteet', { signal: request.signal });
  const tavoite = tavoitteetResponse.find((pm) => pm.id === tavoiteId);

  if (tavoite) {
    const mahdollisuusOpts = {
      signal: request.signal,
      params: { path: { id: tavoite.mahdollisuusId } },
    };
    const mahdollisuusFetch =
      tavoite?.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS'
        ? client.GET('/api/koulutusmahdollisuudet/{id}', mahdollisuusOpts)
        : client.GET('/api/tyomahdollisuudet/{id}', mahdollisuusOpts);

    const { data: mahdollisuus } = await mahdollisuusFetch;

    // Have to get ammattiryhmä basic DTO data separately, as mahdollisuus details endpoint only returns uri,
    // This data is used to populate the ammatiryhmä name and median salary in UI.
    let ammattiryhma: components['schemas']['AmmattiryhmaBasicDto'] | undefined;

    if (tavoite.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS') {
      const m = mahdollisuus as components['schemas']['TyomahdollisuusFullDto'];
      const ammattiryhmaNimet: Record<string, components['schemas']['LokalisoituTeksti']> = {};
      ammattiryhma = (await getTyoMahdollisuusDetails([m.id]).then((details) => details[0])).ammattiryhma;
      const ammattiryhmaUris = ammattiryhma?.uri ? [ammattiryhma.uri] : [];

      if (ammattiryhmaUris.length > 0) {
        const ammattiryhmat = await ammatit.find(ammattiryhmaUris);
        ammattiryhmat.forEach((ar) => {
          ammattiryhmaNimet[ar.uri] = ar.nimi;
        });
        polkuStore.setAmmattiryhmaNimet(ammattiryhmaNimet);
      }
    }

    const vaaditutOsaamiset = await osaamiset.combine(
      mahdollisuus?.jakaumat?.osaaminen?.arvot,
      (value) => value.arvo,
      (value, osaaminen) => ({ ...osaaminen, osuus: value.osuus }),
      request.signal,
    );
    polkuStore.setVaaditutOsaamiset([...vaaditutOsaamiset].sort(sortByProperty(`nimi.${i18n.language ?? 'fi'}`)));

    const { data: profiiliOsaamisetRes = [] } = await client.GET('/api/profiili/osaamiset', { signal: request.signal });
    const profiiliOsaamiset = removeDuplicatesByKey(profiiliOsaamisetRes, (o) => o.osaaminen.uri).filter((o) =>
      vaaditutOsaamiset.some((vaadittu) => vaadittu.uri === o.osaaminen.uri),
    );
    polkuStore.setOsaamisetFromProfile(profiiliOsaamiset.map((osaaminen) => osaaminen.osaaminen));
    polkuStore.setPolutLoading(false);

    return { tavoite, mahdollisuus, vaaditutOsaamiset, profiiliOsaamiset, ammattiryhma };
  }
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
export type PathLoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import i18n from '@/i18n/config';
import { usePolutStore } from '@/stores/usePolutStore';
import { removeDuplicates, sortByProperty } from '@/utils';
import { LoaderFunction } from 'react-router';

const loader = (async ({ request, params }) => {
  const { paamaaraId, suunnitelmaId } = params;
  const polkuStore = usePolutStore.getState();

  if (!paamaaraId || !suunnitelmaId) {
    return { paamaara: null, mahdollisuus: null, vaaditutOsaamiset: [], profiiliOsaamiset: [], polku: null };
  }

  polkuStore.setPolutLoading(true);
  // Fetch polku/suunnitelma
  const { data: polkuResponse, error } = await client.GET('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}', {
    params: {
      path: { id: paamaaraId, suunnitelmaId: suunnitelmaId },
    },
  });

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

  const { data: paamaaratResponse = [] } = await client.GET('/api/profiili/paamaarat', { signal: request.signal });
  const paamaara = paamaaratResponse.find((pm) => pm.id === paamaaraId);

  if (paamaara) {
    const mahdollisuusOpts = {
      signal: request.signal,
      params: { path: { id: paamaara.mahdollisuusId } },
    };
    const mahdollisuusFetch =
      paamaara?.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS'
        ? client.GET('/api/koulutusmahdollisuudet/{id}', mahdollisuusOpts)
        : client.GET('/api/tyomahdollisuudet/{id}', mahdollisuusOpts);

    const { data: mahdollisuus } = await mahdollisuusFetch;

    if (paamaara.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS') {
      const m = mahdollisuus as components['schemas']['TyomahdollisuusDto'];
      const ammattiryhmaNimet: Record<string, components['schemas']['LokalisoituTeksti']> = {};
      const ammattiryhmaUris = m.ammattiryhma?.uri ? [m.ammattiryhma.uri] : [];

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
    const profiiliOsaamiset = removeDuplicates(profiiliOsaamisetRes, 'osaaminen.uri').filter((osaaminen) =>
      vaaditutOsaamiset.some((vaadittu) => vaadittu.uri === osaaminen.osaaminen.uri),
    );
    polkuStore.setOsaamisetFromProfile(profiiliOsaamiset.map((osaaminen) => osaaminen.osaaminen));
    polkuStore.setPolutLoading(false);

    return { paamaara, mahdollisuus, vaaditutOsaamiset, profiiliOsaamiset };
  }
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
export type PathLoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

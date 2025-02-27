import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router';

export default (async ({ request, params }) => {
  const response = await client.GET('/api/profiili/paamaarat', { signal: request.signal });
  const { goalId, pathId } = params;
  const paamaarat = response.data ?? [];
  const paamaara = paamaarat.find((item) => item.id === goalId);

  if (!paamaara) {
    return { paamaara: null, mahdollisuus: null };
  }

  // eslint-disable-next-line sonarjs/no-commented-code
  /* if (!paamaara) {
    return redirect(`${i18n.language}/${i18n.t('slugs.profile.index')}/${i18n.t('slugs.profile.my-goals')}`);
  } */

  const opts = {
    signal: request.signal,
    params: { path: { id: paamaara.mahdollisuusId } },
  };

  const clientFn =
    paamaara?.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS'
      ? client.GET('/api/koulutusmahdollisuudet/{id}', opts)
      : client.GET('/api/tyomahdollisuudet/{id}', opts);

  const { data: mahdollisuus } = await clientFn;
  const competences = await osaamiset.combine(
    mahdollisuus?.jakaumat?.osaaminen?.arvot,
    (value) => value.arvo,
    (value, osaaminen) => ({ ...osaaminen, osuus: value.osuus }),
    request.signal,
  );

  const { data: omatOsaamiset = [] } = await client.GET('/api/profiili/osaamiset', { signal: request.signal });

  if (pathId && pathId !== 'new') {
    // TODO: Fetch path data
  }
  console.log(paamaara, mahdollisuus, competences, omatOsaamiset);

  return { paamaara, mahdollisuus, osaamiset: competences, omatOsaamiset };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

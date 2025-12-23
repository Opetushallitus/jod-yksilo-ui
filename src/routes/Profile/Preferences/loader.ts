import { client } from '@/api/client';
import type { components } from '@/api/schema';
import i18n, { type LangCode } from '@/i18n/config';
import { sortByProperty } from '@/utils';
import { getCodesetValue } from '@/utils/codes/codes';
import { isFeatureEnabled } from '@/utils/features';
import type { LoaderFunction } from 'react-router';

const loader = (async ({ request }) => {
  const [{ data: jakolinkit = [] }, { data: yksiloData }] = await Promise.all([
    isFeatureEnabled('JAKOLINKKI')
      ? client.GET('/api/profiili/jakolinkki', { signal: request.signal }).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
    client.GET('/api/profiili/yksilo/tiedot-ja-luvat', { signal: request.signal }),
  ]);

  const kotikuntaLabel = yksiloData?.kotikunta
    ? await getCodesetValue('kunta', yksiloData?.kotikunta, i18n.language as LangCode)
    : undefined;

  return {
    jakolinkit: [...jakolinkit].sort(sortByProperty('voimassaAsti')),
    yksiloData,
    kotikuntaLabel,
  };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

export type PreferencesLoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

import { LoaderFunction } from 'react-router';

import { client } from '@/api/client';
import { sortByProperty } from '@/utils';
import { isFeatureEnabled } from '@/utils/features';

const loader = (async ({ request }) => {
  const { data: jakolinkit = [] } = await (isFeatureEnabled('JAKOLINKKI')
    ? client.GET('/api/profiili/jakolinkki', { signal: request.signal }).catch(() => ({ data: [] }))
    : Promise.resolve({ data: [] }));

  return {
    jakolinkit: [...jakolinkit].sort(sortByProperty('voimassaAsti')),
  };
}) satisfies LoaderFunction;

export type DataImportExportLoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

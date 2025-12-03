import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { sortByProperty } from '@/utils';
import type { LoaderFunction } from 'react-router';

const loader = (async ({ request }) => {
  const { data: jakolinkit = [] } = await client.GET('/api/profiili/jakolinkki', { signal: request.signal });
  return { jakolinkit: [...jakolinkit].sort(sortByProperty('voimassaAsti')) };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

export type PreferencesLoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

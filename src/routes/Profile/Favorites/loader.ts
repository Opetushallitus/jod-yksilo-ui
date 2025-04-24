import { client } from '@/api/client';
import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const { setExcludedIds, fetchSuosikit, fetchPage } = useSuosikitStore.getState();
  const response = await client.GET('/api/profiili/paamaarat', { signal: request.signal });
  const paamaarat = response.data ?? [];
  setExcludedIds(paamaarat.map((pm) => pm.mahdollisuusId));
  await fetchSuosikit();
  await fetchPage({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  return null;
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

import { components } from '@/api/schema';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { LoaderFunction } from 'react-router';

export default (async () => {
  const { fetchSuosikit, fetchPage } = useSuosikitStore.getState();
  await fetchSuosikit();
  await fetchPage({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  return null;
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

import { components } from '@/api/schema';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { LoaderFunction } from 'react-router-dom';

export default (async () => {
  const { fetchSuosikit, fetchPage } = useSuosikitStore.getState();
  await fetchSuosikit();
  await fetchPage({ page: 1 });
  return null;
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

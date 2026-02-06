import { useSearchStore } from '@/stores/useSearchStore';
import { LoaderFunction } from 'react-router';

const loader = (async ({ request }) => {
  const { search, query } = useSearchStore.getState();
  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get('q') ?? '';
  if (q !== query && q.length >= 3) {
    await search(q);
  }

  return {};
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

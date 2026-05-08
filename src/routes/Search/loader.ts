import { LoaderFunction } from 'react-router';

import { useSearchStore } from '@/stores/useSearchStore';

const loader = (async ({ request }) => {
  const { search, query } = useSearchStore.getState();
  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get('q') ?? '';
  const trimmedQ = q.trim();
  const normalizedQ = trimmedQ.length >= 3 ? trimmedQ : '';

  // Always refresh unfiltered search so persisted/stale results are not reused.
  if (normalizedQ === '' || normalizedQ !== query) {
    await search(normalizedQ);
  }

  return {};
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

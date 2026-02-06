import { useSearchStore } from '@/stores/useSearchStore';
import { LoaderFunction } from 'react-router';

const loader = (async ({ request }) => {
  const { search } = useSearchStore.getState();
  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get('q') ?? '';
  await search(q);

  return {};
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;

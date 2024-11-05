import { client } from '@/api/client';
import { components } from '@/api/schema';
import { useToolStore } from '@/stores/useToolStore';
import { LoaderFunction } from 'react-router-dom';

export interface ToolLoaderData {
  isLoggedIn: boolean;
}

export default (async ({ request, context }) => {
  const state = useToolStore.getState();

  // Load tyomahdollisuudet and ehdotukset if they are not already loaded
  if (state.tyomahdollisuudet.length === 0) {
    await state.updateEhdotuksetAndTyomahdollisuudet();
  }

  // Load suosikit if the user is logged in
  if (context) {
    const suosikitResponse = await client.GET('/api/profiili/suosikit', { signal: request.signal });
    state.setSuosikit(suosikitResponse.data ?? []);
  }

  return { isLoggedIn: !!context } as ToolLoaderData;
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

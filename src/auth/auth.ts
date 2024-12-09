import { registerCsrfMiddleware } from '@/api/middlewares/csrf';
import { components } from '@/api/schema';
import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router';
import { client } from '../api/client';

export const authStore: {
  yksiloPromise: Promise<unknown> | undefined;
} = {
  yksiloPromise: undefined,
};

export const withYksiloContext = (
  load: LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>,
  loginRequired = true,
) => {
  return async (args: LoaderFunctionArgs) => {
    if (authStore.yksiloPromise === undefined) {
      authStore.yksiloPromise = client.GET('/api/profiili/yksilo');
    }

    const { data = null } = (await authStore.yksiloPromise) as { data: components['schemas']['YksiloCsrfDto'] };

    if (data) {
      registerCsrfMiddleware(data.csrf);
    }

    return !loginRequired || data ? await load({ ...args, context: data }) : redirect('/');
  };
};

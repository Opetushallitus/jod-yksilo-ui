import { registerCsrfMiddleware } from '@/api/middlewares/csrf';
import { components } from '@/api/schema';
import i18n from '@/i18n/config';
import { LoaderFunction, LoaderFunctionArgs, redirect, replace } from 'react-router';
import { client } from '../api/client';

let showed = false;

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

      const { lng } = args.params;
      const url = `/${lng}/${i18n.t('slugs.introduction', { lng })}`;
      if (!data.tervetuloapolku) {
        if (!showed) {
          showed = true;
          return replace(url);
        }
      } else {
        if (args.request.url.endsWith(url)) {
          return replace('/');
        }
      }
    }

    return !loginRequired || data ? await load({ ...args, context: data }) : redirect('/');
  };
};

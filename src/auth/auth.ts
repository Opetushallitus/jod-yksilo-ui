import i18n from '@/i18n/config';
import { useSessionManagerStore, YksiloLoaderContext } from '@/stores/useSessionManagerStore';
import { LoaderFunction, LoaderFunctionArgs, redirect, replace } from 'react-router';
import { hasWelcomePathBeenShown, markWelcomePathShown } from './welcomePathGate';

export const withYksiloContext = (load: LoaderFunction<YksiloLoaderContext>, loginRequired = true) => {
  return async (args: LoaderFunctionArgs) => {
    const yksilo = await useSessionManagerStore.getState().syncYksiloFromServer();

    const isProtectedRoute = args.request.url.includes(`/${args.params.lng}/${i18n.t('slugs.profile.index')}`);

    if (isProtectedRoute && !yksilo) {
      return replace('/');
    }

    if (yksilo) {
      const { lng } = args.params;
      const url = `/${lng}/${i18n.t('slugs.profile.index', { lng })}`;

      if (!yksilo.tervetuloapolku && loginRequired) {
        if (!hasWelcomePathBeenShown()) {
          markWelcomePathShown();
          return replace(url);
        }
      } else {
        if (args.request.url.endsWith(url)) {
          return replace('/');
        }
      }
    }

    return !loginRequired || yksilo ? await load({ ...args, context: yksilo }) : redirect('/');
  };
};

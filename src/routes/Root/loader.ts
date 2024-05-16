import { LoaderFunction, redirect } from 'react-router-dom';
import i18n, { resources, fallbackLng } from '@/i18n/config';

export interface RootLoaderData {
  csrf?: { headerName: string; parameterName: string; token: string };
}

export default (async ({ params }) => {
  const data: RootLoaderData = {};

  // Change language if it is different from the current language
  const lng = params.lng;
  if (lng && lng !== i18n.language && Object.keys(resources).includes(lng)) {
    await i18n.changeLanguage(lng);
  } else {
    redirect(`/${fallbackLng}`);
  }

  // Fetch CSRF token
  const response = await fetch('/api/csrf', {
    signal: AbortSignal.timeout(10000),
  });
  if (response.ok) {
    data.csrf = (await response.json()) as RootLoaderData['csrf'];
  }

  return data;
}) satisfies LoaderFunction;

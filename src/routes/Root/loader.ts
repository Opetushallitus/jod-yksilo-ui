import { LoaderFunction, redirect } from 'react-router-dom';
import i18n, { resources, fallbackLng } from '@/i18n/config';

export interface RootLoaderData {
  csrf?: { headerName: string; parameterName: string; token: string };
}

export default (async ({ params: { lng } }) => {
  // Redirect if the language is not supported
  if (lng && !Object.keys(resources).includes(lng)) {
    return redirect(`/${fallbackLng}`);
  }

  // Change language if it is different from the current language
  if (lng && lng !== i18n.language && Object.keys(resources).includes(lng)) {
    await i18n.changeLanguage(lng);
  }

  // Fetch CSRF token
  const data: RootLoaderData = {};
  const response = await fetch('/api/csrf', {
    signal: AbortSignal.timeout(10000),
  });
  if (response.ok) {
    data.csrf = (await response.json()) as RootLoaderData['csrf'];
  }

  return data;
}) satisfies LoaderFunction;

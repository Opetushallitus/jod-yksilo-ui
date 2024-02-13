import { LoaderFunction, redirect } from 'react-router-dom';
import i18n, { resources, fallbackLng } from '@/i18n/config';

export default (async ({ params }) => {
  const lng = params.lng;

  if (i18n.language === lng) {
    return null;
  }

  if (lng && Object.keys(resources).includes(lng)) {
    return i18n.changeLanguage(lng);
  } else {
    return redirect(`/${fallbackLng}`);
  }
}) satisfies LoaderFunction;

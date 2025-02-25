import i18n from '@/i18n/config';
import { Middleware } from 'openapi-fetch';
import toast from 'react-hot-toast/headless';
import { paths } from '../schema';

const modifyingMethods = ['PUT', 'POST', 'DELETE', 'PATCH'] as const;

type Method = (typeof modifyingMethods)[number];

const isModifyingMethod = (method: string): method is Method => {
  return modifyingMethods.includes(method as Method);
};

const ignoredOperations: Partial<Record<keyof paths, Method>> = {
  '/api/ehdotus/osaamiset': 'POST',
  '/api/ehdotus/mahdollisuudet': 'POST',
  '/api/keskustelut': 'POST',
  '/api/keskustelut/{id}': 'POST',
};

const showToast = (method: Method, response: Response) => {
  const suffix = response.ok ? 'success' : 'failed';
  const toastFn = response.ok ? toast.success : toast.error;

  switch (method) {
    case 'DELETE':
      toastFn(i18n.t(`toast.delete-${suffix}`));
      break;
    case 'POST':
      toastFn(i18n.t(`toast.add-${suffix}`));
      break;
    default:
      toastFn(i18n.t(`toast.update-${suffix}`));
      break;
  }
};

const stripUrlPrefix = (url: string): string => {
  const apiIndex = url.indexOf('/api/');
  return apiIndex !== -1 ? url.slice(apiIndex) : url;
};

export const toastMiddleware: Middleware = {
  onResponse({ response, request }) {
    const strippedUrl = stripUrlPrefix(request.url);
    // Regular expression to detect UUID at the end of the path
    const uuidRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const urlWithoutUUID = strippedUrl.replace(uuidRegex, '/{id}') as keyof paths;
    const ignoredPathMethod = ignoredOperations[urlWithoutUUID];

    if (isModifyingMethod(request.method) && request.method !== ignoredPathMethod) {
      showToast(request.method, response);
    }
    return response;
  },
};

import i18n from '@/i18n/config';
import { Middleware } from 'openapi-fetch';
import toast from 'react-hot-toast/headless';
import { paths } from '../schema';

const modifyingMethods = ['PUT', 'POST', 'DELETE', 'PATCH'] as const;

type Method = (typeof modifyingMethods)[number];

const isModifyingMethod = (method: string): method is Method => {
  return modifyingMethods.includes(method as Method);
};

const ignoredOperations: Partial<Record<keyof paths, Method[]>> = {
  '/api/ehdotus/osaamiset': ['POST'],
  '/api/ehdotus/mahdollisuudet': ['POST'],
  '/api/keskustelut': ['POST'],
  '/api/keskustelut/{id}': ['POST'],
  '/api/ehdotus/mahdollisuudet/polku': ['POST'],
  '/api/profiili/tavoitteet/{id}/suunnitelmat/{suunnitelmaId}': ['DELETE', 'PUT'],
  '/api/profiili/tavoitteet/{id}/suunnitelmat': ['POST'],
  '/api/integraatiot/tmt/vienti': ['POST'],
  '/api/integraatiot/tmt/haku': ['POST'],
};

const showToast = (method: Method, response: Response) => {
  const toastFn = response.ok ? toast.success : toast.error;

  switch (method) {
    case 'DELETE':
      toastFn(response.ok ? i18n.t(`toast.delete-success`) : i18n.t(`toast.delete-failed`));
      break;
    case 'POST':
      toastFn(response.ok ? i18n.t(`toast.add-success`) : i18n.t(`toast.add-failed`));
      break;
    default:
      toastFn(response.ok ? i18n.t(`toast.update-success`) : i18n.t(`toast.update-failed`));
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
    // Regular expression to detect UUIDs in the URL
    const uuidRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
    // Replace all UUID matches with /{uuid}
    const normalizedUrl = strippedUrl.replaceAll(uuidRegex, '/{uuid}');
    // Create a copy of ignoredOperations with all parameterized segments like /{someId} replaced with /{uuid} for comparison
    const normalizedIgnoredOperations = Object.fromEntries(
      Object.entries(ignoredOperations).map(([key, value]) => [key.replaceAll(/\/\{[^}]+\}/g, '/{uuid}'), value]),
    );

    const ignoredPathMethods = normalizedIgnoredOperations[normalizedUrl] ?? [];
    if (isModifyingMethod(request.method) && !ignoredPathMethods?.includes(request.method)) {
      showToast(request.method, response);
    }
    return response;
  },
};

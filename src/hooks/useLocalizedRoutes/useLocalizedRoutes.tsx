import React from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useMatches, useParams, useSearchParams } from 'react-router';

export const useLocalizedRoutes = () => {
  const matches = useMatches();
  const params = useParams();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Generate localized path in given language
  const generateLocalizedPath = React.useCallback(
    (lng: string) => {
      const pathnameParts: string[] = [];
      matches.forEach((match) => {
        const { id } = match;
        if (id === 'root') {
          // Add language to root
          pathnameParts.push(lng);
        } else if (id.includes('|')) {
          // Split id to get path
          const path = id.split('|')[0];
          // Replace path parameters with translations
          const localizedPath = path.replace(/{([^{}]*)}/g, (_m, translationKey: string) => {
            return t(translationKey, { lng });
          });
          pathnameParts.push(localizedPath);
        }
      });
      const generatedPath = generatePath(`/${pathnameParts.join('/')}`, params);
      const searchParamsString = searchParams.toString();
      const qs = searchParamsString ? `?${searchParamsString}` : '';
      return `${generatedPath}${qs}`;
    },
    [matches, params, searchParams, t],
  );

  return { generateLocalizedPath };
};

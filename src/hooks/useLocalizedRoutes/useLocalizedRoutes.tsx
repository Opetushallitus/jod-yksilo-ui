import React from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useMatches, useParams } from 'react-router-dom';

export const useLocalizedRoutes = () => {
  const matches = useMatches();
  const params = useParams();
  const { t } = useTranslation();

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
          const localizedPath: string = path.replaceAll(/{(.*?)}/g, (m: string) => {
            const translationKey = m.slice(1, -1); // Remove curly braces
            return t(translationKey, { lng });
          });
          pathnameParts.push(localizedPath);
        }
      });

      return generatePath(`/${pathnameParts.join('/')}`, params);
    },
    [matches, params, t],
  );

  return { generateLocalizedPath };
};

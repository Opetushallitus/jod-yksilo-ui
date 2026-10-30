import { useTranslation } from 'react-i18next';

import { JodOpenInNew } from '@jod/design-system/icons';

export const ExternalLink = ({ children, href }: { children?: React.ReactNode; href: string }) => {
  const { t } = useTranslation();

  return (
    <a href={href} className="inline-flex items-center text-accent underline" target="_blank" rel="noopener noreferrer">
      {children} <JodOpenInNew ariaLabel={t('common:external-link')} />
    </a>
  );
};

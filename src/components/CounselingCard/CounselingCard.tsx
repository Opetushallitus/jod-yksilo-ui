import { getLinkTo } from '@/utils/routeUtils';
import { Button } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

export const CounselingCard = () => {
  const { t, i18n } = useTranslation();

  const links: Record<string, string> = {
    fi: 'https://www.suomi.fi/palveluhakemisto/osaamispolku',
    sv: 'https://www.suomi.fi/tjanstekatalog/osaamispolku',
    en: 'https://www.suomi.fi/service-catalog/osaamispolku',
  };
  const link = links[i18n.language] || links.fi;

  return (
    <div className="flex flex-col bg-secondary-3-dark rounded-lg p-6 gap-3 text-white">
      <h2 className="text-heading-2">{t('service-catalog.header')}</h2>
      <div className="flex flex-col gap-6">
        <p className="text-body-lg">{t('service-catalog.description')}</p>
        <Button
          label={t('move-to-service')}
          iconSide="right"
          icon={<JodOpenInNew size={24} ariaLabel={t('external-link')} />}
          variant="white"
          linkComponent={getLinkTo(link, { useAnchor: true, target: '_blank' })}
          className="w-fit"
          data-testid="counseling-banner-button"
        />
      </div>
    </div>
  );
};

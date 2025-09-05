import { getLinkTo } from '@/utils/routeUtils';
import { Button } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

export const CounselingBanner = () => {
  const { t, i18n } = useTranslation();

  const links: Record<string, string> = {
    fi: 'https://www.suomi.fi/palveluhakemisto/osaamispolku',
    sv: 'https://www.suomi.fi/tjanstekatalog/osaamispolku',
    en: 'https://www.suomi.fi/service-catalog/osaamispolku',
  };
  const link = links[i18n.language] || links.fi;
  return (
    <div className="bg-secondary-3 flex flex-col rounded-lg h-[271px] p-6 mt-4">
      <div className="flex items-start mb-2">
        <div className="text-heading-2 text-white mr-2">{t('service-catalog.header')}</div>
      </div>
      <div className="flex items-center mb-2">
        <p className="text-body-lg text-white">{t('service-catalog.description')}</p>
      </div>
      <div className="bg-white flex items-center justify-between w-fit h-9 rounded-[30px] mt-auto whitespace-nowrap">
        <Button
          label={t('move-to-service')}
          iconSide="right"
          icon={<JodArrowRight size={24} />}
          variant="white"
          LinkComponent={getLinkTo(link, { useAnchor: true, target: '_blank' })}
          data-testid="counseling-banner-button"
        ></Button>
      </div>
    </div>
  );
};

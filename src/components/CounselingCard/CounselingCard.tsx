import { useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';

import { getLinkTo } from '@/utils/routeUtils';

export const CounselingCard = () => {
  const { t, i18n } = useTranslation();

  const links: Record<string, string> = {
    fi: 'https://www.suomi.fi/aihe/ohjaus-ja-neuvontapalveluja',
    sv: 'https://www.suomi.fi/amne/vaglednings-och-radgivningstjanster',
    en: 'https://www.suomi.fi/topic/guidance-and-counselling-services',
  };
  const link = links[i18n.language] || links.fi;

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-primary-2-dark p-6 text-white">
      <h2 className="text-heading-2">{t('service-catalog.header')}</h2>
      <div className="flex flex-col gap-6">
        <p className="text-body-lg">{t('service-catalog.description')}</p>
        <Button
          label={t('move-to-service')}
          iconSide="right"
          icon={<JodOpenInNew size={24} ariaLabel={t('common:external-link')} />}
          variant="white"
          linkComponent={getLinkTo(link, { useAnchor: true, target: '_blank' })}
          className="w-fit"
          testId="counseling-banner-button"
        />
      </div>
    </div>
  );
};

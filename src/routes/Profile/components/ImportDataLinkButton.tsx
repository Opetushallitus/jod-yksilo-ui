import { useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';

import { useHasToiminto } from '@/stores/useSessionManagerStore';
import { isFeatureEnabled } from '@/utils/features';
import { getLinkTo } from '@/utils/routeUtils';

interface ImportDataLinkButtonProps {
  /** Additional import source besides CV shown in the label, if available for the user */
  source?: 'TMT' | 'KOSKI';
  testId?: string;
}

/** Link button to the "Tuo ja vie tietoja" page. Label reflects which import sources are available. */
export const ImportDataLinkButton = ({ source, testId }: ImportDataLinkButtonProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const hasTmtToiminto = useHasToiminto('TMT');
  const hasKoskiToiminto = useHasToiminto('KOSKI');

  const hasCv = isFeatureEnabled('CV_IMPORT');
  const hasSource =
    (source === 'TMT' && isFeatureEnabled('TMT_INTEGRATION') && hasTmtToiminto) ||
    (source === 'KOSKI' && isFeatureEnabled('KOSKI') && hasKoskiToiminto);

  if (!hasCv && !hasSource) {
    return null;
  }

  const getLabel = () => {
    if (source === 'TMT' && hasSource) {
      return hasCv
        ? t('profile.data-import-export.import-link.cv-or-tmt')
        : t('profile.data-import-export.import-link.tmt');
    }
    if (source === 'KOSKI' && hasSource) {
      return hasCv
        ? t('profile.data-import-export.import-link.cv-or-koski')
        : t('profile.data-import-export.import-link.koski');
    }
    return t('profile.data-import-export.import-link.cv');
  };

  return (
    <Button
      label={getLabel()}
      variant="white"
      iconSide="right"
      icon={<JodArrowRight />}
      linkComponent={getLinkTo(`/${language}/${t('slugs.profile.index')}/${t('slugs.profile.data-import-export')}`)}
      testId={testId}
    />
  );
};

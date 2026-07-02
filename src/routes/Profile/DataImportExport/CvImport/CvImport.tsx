import { Trans, useTranslation } from 'react-i18next';

import { AiInfoButton, Button } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';

import { AnchorLink } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';

import CvImportWizard from './CvImportWizard';

const TooltipContent = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <div className="flex max-w-[290px] flex-col gap-3 text-body-xs leading-5">
      <p className="font-semibold">{'Osaamisprofiilin täyttö tekoälyn avulla.'}</p>
      <p>{t('ai-info-tooltip.description-cv-import')}</p>
      <div>
        <Trans
          i18nKey="ai-info-tooltip.description-summary"
          components={{
            Icon: <JodOpenInNew size={18} ariaLabel={t('common:external-link')} />,
            CustomLink: (
              <AnchorLink
                href={`/${language}/${t('common:slugs.ai-usage')}`}
                className="inline-flex underline"
                target="_blank"
              />
            ),
          }}
        />
      </div>
    </div>
  );
};

const CvImport = () => {
  const { t } = useTranslation();

  const { showModal } = useModal();
  const guardedAction = useSessionGuardedAction();

  return (
    <div>
      <h3 className="mb-3 text-heading-3-mobile sm:text-heading-3" data-testid="cv-import-title">
        {t('preferences.cv-import.title')}
        <div className="ml-2 inline *:align-top print:hidden">
          <AiInfoButton tooltipContent={<TooltipContent />} ariaLabel={t('ai-info-tooltip.aria-description')} />
        </div>
      </h3>
      <p className="mb-6 font-arial">{t('preferences.cv-import.description')}</p>

      <Button
        label={t('preferences.cv-import.import-from-cv')}
        size="sm"
        variant="accent"
        ariaHaspopup="dialog"
        onClick={guardedAction(showModal, CvImportWizard)}
        testId="cv-import-button"
      />
    </div>
  );
};

export default CvImport;

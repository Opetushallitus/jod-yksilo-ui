import { useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';

import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';

import CvImportWizard from './CvImportWizard';

export const CvImport = () => {
  const { t } = useTranslation();

  const { showModal } = useModal();
  const guardedAction = useSessionGuardedAction();

  return (
    <div>
      <h3 className="mb-3 text-heading-3-mobile sm:text-heading-3">{t('preferences.cv-import.title')}</h3>
      <p className="mb-7 font-arial">{t('preferences.cv-import.description')}</p>

      <Button
        label={t('preferences.cv-import.import-from-cv')}
        variant="accent"
        ariaHaspopup="dialog"
        onClick={guardedAction(showModal, CvImportWizard)}
      />
    </div>
  );
};

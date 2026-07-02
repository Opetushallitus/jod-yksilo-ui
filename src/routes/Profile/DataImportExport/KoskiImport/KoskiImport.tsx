import { useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';

import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { useKoskiImport } from '@/routes/Profile/EducationHistory/useKoskiImport';

const KoskiImport = () => {
  const { t } = useTranslation();
  const guardedAction = useSessionGuardedAction();
  const { openImportStartModal } = useKoskiImport();

  return (
    <div>
      <h3 className="mb-3 text-heading-3-mobile sm:text-heading-3">{t('preferences.koski-import.title')}</h3>
      <p className="mb-6 font-arial">{t('preferences.koski-import.description')}</p>

      <Button
        label={t('preferences.koski-import.button-label')}
        size="sm"
        variant="accent"
        ariaHaspopup="dialog"
        onClick={guardedAction(openImportStartModal)}
      />
    </div>
  );
};

export default KoskiImport;

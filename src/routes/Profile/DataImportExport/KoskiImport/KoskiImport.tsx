import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';

import { AnchorLink } from '@/components';
import { ImportInfoBox } from '@/components/ImportInfoBox/ImportInfoBox';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { useKoskiImport } from '@/routes/Profile/EducationHistory/useKoskiImport';

const KoskiImport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
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

      <ImportInfoBox>
        <Trans
          i18nKey="preferences.koski-import.result-info"
          components={{
            EducationHistoryLink: (
              <AnchorLink
                href={`/yksilo/${language}/${t('slugs.profile.index')}/${t('slugs.profile.competences')}/${t('slugs.profile.education-history')}`}
                className="inline-flex underline"
              />
            ),
          }}
        />
      </ImportInfoBox>
    </div>
  );
};

export default KoskiImport;

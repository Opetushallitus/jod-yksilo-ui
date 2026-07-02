import { useTranslation } from 'react-i18next';

import { MainLayout, useMediaQueries } from '@jod/design-system';

import { Breadcrumb } from '@/components';
import { useHasToiminto } from '@/stores/useSessionManagerStore';
import { isFeatureEnabled } from '@/utils/features';

import { ShareLinkSection, TmtImportExport, CvImport, KoskiImport } from '.';
import { Divider, ProfileNavigationList, ProfileSectionTitle } from '../components';

const DataImportExport = () => {
  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const hasTmtToiminto = useHasToiminto('TMT');
  const hasKoskiToiminto = useHasToiminto('KOSKI');

  const title = t('profile.data-import-export.title');
  const hasImportExportContent =
    (isFeatureEnabled('TMT_INTEGRATION') && hasTmtToiminto) ||
    (isFeatureEnabled('KOSKI') && hasKoskiToiminto) ||
    isFeatureEnabled('CV_IMPORT');

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{title}</title>
      <div className="px-5 sm:px-6 lg:pr-0 lg:pl-6">
        <ProfileSectionTitle type="TUO_JA_VIE_TIETOJA" title={title} />
        <div className="mb-8 flex flex-col gap-7 text-body-lg-mobile sm:text-body-lg">
          <p>{t('profile.data-import-export.description')}</p>
        </div>

        {hasImportExportContent && (
          <>
            <section>
              <h2 className="mb-3 text-heading-2-mobile sm:text-heading-2">{t('preferences.import-export.title')}</h2>

              <div className="flex flex-col gap-7">
                {isFeatureEnabled('TMT_INTEGRATION') && hasTmtToiminto && <TmtImportExport />}
                {isFeatureEnabled('KOSKI') && hasKoskiToiminto && <KoskiImport />}
                {isFeatureEnabled('CV_IMPORT') && <CvImport />}
              </div>
            </section>
            <Divider className="mt-8 mb-7" />
          </>
        )}

        {isFeatureEnabled('JAKOLINKKI') && <ShareLinkSection className="mb-7" />}
      </div>
    </MainLayout>
  );
};

export default DataImportExport;

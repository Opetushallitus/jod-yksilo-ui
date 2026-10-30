import { Trans, useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { Button, IconHeading, MainLayout, useMediaQueries } from '@jod/design-system';
import { JodArrowRight, JodUser } from '@jod/design-system/icons';

import { Breadcrumb, ExternalLink } from '@/components';
import { useSessionManagerStore } from '@/stores/useSessionManagerStore';
import { getLinkTo } from '@/utils/routeUtils';

import { ProfileNavigationList } from '../components';
import { ToolCard } from '../components/ToolCard';
import type { ProfileSummary as ProfileSummaryData } from './loader';
import { ProfileSummary } from './ProfileSummary';

const listComponents = {
  ul: <ul />,
  li: <li className="ml-6 list-disc" />,
  strong: <strong />,
};

const ProfileFront = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { lg } = useMediaQueries();
  const firstName = useSessionManagerStore((s) => s.user?.etunimi);
  const summary = useLoaderData<ProfileSummaryData>();
  const profilePath = `/${language}/${t('slugs.profile.index')}`;

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard testId="profile-front-go-to-tool" />
        </div>
      }
      testId="profile-front-page"
    >
      {!lg && (
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}
      <title>{t('profile.index')}</title>
      <div className="px-5 sm:px-6 lg:pr-0 lg:pl-6">
        <IconHeading
          icon={<JodUser />}
          title={t('profile.front.title', { name: firstName ?? 'Nimetön' })}
          testId="profile-front-title"
        />

        <div className="mb-8 flex flex-col gap-8 font-arial text-body-md">
          <p className="font-poppins text-body-lg-mobile sm:text-body-lg">{t('profile.front.ingress')}</p>
          <ProfileSummary summary={summary} />
          <section className="flex flex-col gap-5">
            <h2 className="font-poppins text-heading-2-mobile sm:text-heading-2">
              {t('profile.front.opportunities.title')}
            </h2>

            <Trans i18nKey="profile.front.opportunities.list" components={listComponents} />

            <Button
              label={t('profile.front.opportunities.button')}
              variant="accent"
              iconSide="right"
              icon={<JodArrowRight />}
              linkComponent={getLinkTo(`/${language}/${t('slugs.tool.index')}`)}
              className="w-fit"
              testId="profile-front-opportunities-button"
              size="sm"
            />
          </section>

          <section className="flex flex-col gap-5">
            <h2 className="font-poppins text-heading-2-mobile sm:text-heading-2">{t('profile.front.control.title')}</h2>
            <div>
              <p>{t('profile.front.control.list-title')}</p>
              <Trans i18nKey="profile.front.control.list" components={listComponents} />
            </div>
            <Button
              label={t('profile.front.control.preferences-button')}
              variant="white"
              iconSide="right"
              icon={<JodArrowRight />}
              linkComponent={getLinkTo(`${profilePath}/${t('slugs.profile.preferences')}`)}
              className="w-fit"
              testId="profile-front-preferences-button"
              size="sm"
            />
            <p>{t('profile.front.control.share-description')}</p>
            <Button
              label={t('profile.front.control.share-button')}
              variant="white"
              iconSide="right"
              icon={<JodArrowRight />}
              linkComponent={getLinkTo(`${profilePath}/${t('slugs.profile.data-import-export')}`)}
              className="w-fit"
              testId="profile-front-share-button"
              size="sm"
            />
          </section>

          <p>
            <Trans
              i18nKey="profile.front.legal"
              components={{
                LawLink: <ExternalLink href={t('profile.front.legal-link')} />,
                PrivacyLink: <ExternalLink href={`/${language}/${t('common:slugs.privacy-and-cookies')}`} />,
              }}
            />
          </p>
        </div>
        {lg ? null : <ToolCard testId="profile-front-go-to-tool" className="mt-6" />}
      </div>
    </MainLayout>
  );
};

export default ProfileFront;

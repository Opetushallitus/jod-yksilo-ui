import { getLinkTo } from '@/utils/routeUtils';
import { Button } from '@jod/design-system';
import { JodFavs, JodInterests, JodOther, JodSkills, JodWork } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import CategorizedCompetenceTagList from './CategorizedCompetenceTagList';
import { CompetenceExport } from './components/CompetenceExport';
import { CompetenceImport } from './components/CompetenceImport';
import { IconWrapper } from './components/IconWrapper';
import { useTool } from './hook/useTool';
import type { ToolLoaderData } from './loader';

const TextWithIconListItem = ({ text, icon }: { text: string; icon: React.ReactNode }) => {
  return (
    <li>
      <div className="flex gap-x-3 items-center">
        {icon}
        <div className="text-heading-4">{text}</div>
      </div>
    </li>
  );
};

const Unauthenticated = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <p className="font-arial text-body-sm leading-5 text-secondary-gray">
        {t('tool.competency-profile.login-description')}
      </p>
      <Button
        label={t('tool.competency-profile.login-to-service')}
        size="sm"
        iconSide="right"
        variant="gray"
        className="w-fit"
        linkComponent={getLinkTo(`/${language}/${t('slugs.profile.login')}`, {
          state: { callbackURL: t('slugs.tool.index') },
        })}
        data-testid="tool-open-login"
      />
      <p className="font-arial text-body-sm leading-5 text-secondary-gray mt-5">
        {t('tool.competency-profile.sections-intro')}
      </p>
      <ul className="flex flex-col gap-3 my-3">
        <TextWithIconListItem
          icon={<IconWrapper color="#AD4298" Icon={JodWork} />}
          text={t('tool.tools.work-history')}
        />
        <TextWithIconListItem
          icon={<IconWrapper color="#00818A" Icon={JodSkills} />}
          text={t('tool.tools.education-history')}
        />
        <TextWithIconListItem
          icon={<IconWrapper color="#006db3" Icon={JodInterests} />}
          text={t('tool.tools.free-time-activities')}
        />
        <TextWithIconListItem
          icon={<IconWrapper color="#6E6E6E" Icon={JodOther} />}
          text={t('tool.tools.something-else')}
        />
        <TextWithIconListItem
          icon={<IconWrapper color="#EE7C45" Icon={JodFavs} />}
          text={t('profile.interests.title')}
        />
      </ul>
    </div>
  );
};

const AuthenticatedEmptyState = ({ onImportSuccess }: { onImportSuccess?: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5 mb-3">
      <p className="font-arial text-body-md leading-5 text-secondary-gray">
        {t('tool.competency-profile.import-help')}
      </p>
      <CompetenceImport onImportSuccess={onImportSuccess} />
      <p className="font-arial text-body-md leading-5 text-secondary-gray mt-5">
        {t('tool.competency-profile.export-help')}
      </p>
      <CompetenceExport />
    </div>
  );
};

const AuthenticatedWithDataState = ({ onImportSuccess }: { onImportSuccess?: () => void }) => {
  return (
    <div className="flex flex-col gap-6 whitespace-pre-line">
      <CategorizedCompetenceTagList />
      <div className="flex flex-row gap-3 mb-4">
        <CompetenceImport onImportSuccess={onImportSuccess} />
        <CompetenceExport />
      </div>
    </div>
  );
};

const ProfileImportExport = ({ onImportSuccess }: { onImportSuccess?: () => void }) => {
  const { hasProfileCompetences, hasOtherProfileData } = useTool();

  const { isLoggedIn } = useLoaderData<ToolLoaderData>();

  const Authenticated =
    hasProfileCompetences || hasOtherProfileData ? AuthenticatedWithDataState : AuthenticatedEmptyState;

  return isLoggedIn ? <Authenticated onImportSuccess={onImportSuccess} /> : <Unauthenticated />;
};

export default ProfileImportExport;

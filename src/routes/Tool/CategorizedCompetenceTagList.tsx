import AddedTags from '@/components/OsaamisSuosittelija/AddedTags';
import type { OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { Button, EmptyState } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PROFILE_TYPES, useTool } from './hook/useTool';

const freeFormTextExpandedLimit = 100;

const FreeFormText = ({ description, onChange }: { description: string; onChange: () => void }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="font-arial text-primary-gray">
        {isExpanded || description.length <= freeFormTextExpandedLimit
          ? description
          : `${description.slice(0, freeFormTextExpandedLimit)}…`}
      </div>
      {description.length > freeFormTextExpandedLimit && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-left text-body-sm cursor-pointer text-accent"
        >
          {t(isExpanded ? 'show-less' : 'show-more')}
        </button>
      )}
      <Button variant="plain" className="ml-2" onClick={onChange} label={t('tool.competency-profile.delete-text')} />
    </div>
  );
};

const CompetenceCategory = ({
  osaamiset,
  onChange,
  lahdeTyyppi,
}: {
  osaamiset: OsaaminenValue[];
  onChange: (ids: string[]) => () => void;
  lahdeTyyppi?: OsaaminenLahdeTyyppi;
}) => {
  return (
    <ul className="gap-3 flex flex-wrap">
      <AddedTags osaamiset={osaamiset} onClick={onChange} lahdetyyppi={lahdeTyyppi} />
    </ul>
  );
};

/**
 * Renders categorized tags for competences or interests.
 */
const CategorizedCompetenceTagList = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    profileCompetencesByType,
    hasProfileCompetences,
    removeKiinnostus,
    removeOsaaminen,
    osaamiset,
    setOsaamiset,
    kiinnostukset,
    setKiinnostukset,
    hasOtherProfileData,
    osaamisetVapaateksti,
    setOsaamisetVapaateksti,
    kiinnostuksetVapaateksti,
    setKiinnostuksetVapaateksti,
  } = useTool();
  const competencesFromProfileId = React.useId();

  return (
    <div className="flex flex-col">
      <div id={competencesFromProfileId} className="text-heading-4">
        {t('tool.info-overview.data-from-profile')}
      </div>
      {hasProfileCompetences ? (
        <div className="flex flex-col gap-4">
          <div className="font-arial text-body-sm text-secondary-gray">{t('tool.remove-competence-help')}</div>
          <ul className="" aria-labelledby={competencesFromProfileId}>
            {Object.entries(profileCompetencesByType).map(([type, compentences]) => (
              <li className="mb-4" key={type}>
                <CompetenceCategory
                  osaamiset={compentences}
                  onChange={type === 'KIINNOSTUS' ? removeKiinnostus : removeOsaaminen}
                />
              </li>
            ))}
          </ul>
          {osaamiset.length + kiinnostukset.length > 1 && (
            <Button
              variant="plain"
              onClick={() => {
                setOsaamiset(osaamiset.filter((o) => o.tyyppi && !PROFILE_TYPES.includes(o.tyyppi)));
                setKiinnostukset(
                  kiinnostukset.filter((o) => o.tyyppi && ![...PROFILE_TYPES, 'KIINNOSTUS'].includes(o.tyyppi)),
                );
              }}
              className="ml-2"
              label={t('tool.competency-profile.delete-all')}
            />
          )}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState text={t('tool.info-overview.no-competences-from-profile')} />
        </div>
      )}
      {hasOtherProfileData ? (
        <>
          <div className="text-heading-4 mt-6">{t('tool.info-overview.other-data-from-profile')}</div>
          <div className="font-arial text-body-sm text-secondary-gray mb-4">
            {t('tool.info-overview.other-data-from-profile-description')}
          </div>
          <div className="flex flex-col gap-4">
            {osaamisetVapaateksti?.[language] && (
              <FreeFormText
                description={osaamisetVapaateksti[language]}
                onChange={() => setOsaamisetVapaateksti(undefined)}
              />
            )}

            {kiinnostuksetVapaateksti?.[language] && (
              <FreeFormText
                description={kiinnostuksetVapaateksti[language]}
                onChange={() => setKiinnostuksetVapaateksti(undefined)}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
export default CategorizedCompetenceTagList;

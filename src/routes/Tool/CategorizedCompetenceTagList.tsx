import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, EmptyState } from '@jod/design-system';

import AddedTags from '@/components/OsaamisSuosittelija/AddedTags';
import type { OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';

import { PROFILE_TYPES, useTool } from './hook/useTool';

const freeFormTextExpandedLimit = 100;

const FreeFormText = ({
  description,
  onChange,
  testId,
}: {
  description: string;
  onChange: () => void;
  testId?: string;
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const getTestId = (postfix: string) => (testId ? `${testId}-${postfix}` : undefined);

  return (
    <div className="flex flex-col gap-3" data-testid={testId}>
      <div
        className="font-arial text-primary-gray"
        data-testid={getTestId(isExpanded ? 'expanded-description' : 'description')}
      >
        {isExpanded || description.length <= freeFormTextExpandedLimit
          ? description
          : `${description.slice(0, freeFormTextExpandedLimit)}…`}
      </div>
      {description.length > freeFormTextExpandedLimit && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer text-left text-body-sm text-accent"
          data-testid={getTestId(isExpanded ? 'show-less-button' : 'show-more-button')}
        >
          {t(isExpanded ? 'show-less' : 'show-more')}
        </button>
      )}
      <Button
        variant="plain"
        className="ml-2"
        onClick={onChange}
        label={t('tool.competency-profile.delete-text')}
        testId={getTestId('remove-text-button')}
      />
    </div>
  );
};

const CompetenceCategory = ({
  osaamiset,
  onChange,
  lahdeTyyppi,
  testId,
}: {
  osaamiset: OsaaminenValue[];
  onChange: (ids: string[]) => () => void;
  lahdeTyyppi?: OsaaminenLahdeTyyppi;
  testId?: string;
}) => {
  return (
    <ul className="flex flex-wrap gap-3" data-testid={testId}>
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
    kuvaukset,
    setKuvaukset,
  } = useTool();
  const competencesFromProfileId = React.useId();

  const mappedKuvaukset = React.useMemo(
    () =>
      (kuvaukset ?? []).map((k, index) => ({
        key: `free-form-text-${index}`,
        data: k,
      })),
    [kuvaukset],
  );

  return (
    <div className="flex flex-col">
      <div id={competencesFromProfileId} className="text-heading-4" data-testid="competences-from-profile-title">
        {t('tool.info-overview.data-from-profile')}
      </div>
      {hasProfileCompetences ? (
        <div className="flex flex-col gap-4">
          <div className="font-arial text-body-sm text-secondary-gray">{t('tool.remove-competence-help')}</div>
          <ul className="" aria-labelledby={competencesFromProfileId} data-testid="competences-from-profile-list">
            {Object.entries(profileCompetencesByType).map(([type, compentences]) => (
              <li className="mb-4" key={type}>
                <CompetenceCategory
                  osaamiset={compentences}
                  onChange={type === 'KIINNOSTUS' ? removeKiinnostus : removeOsaaminen}
                  testId={`${type.toLowerCase()}-competences-list`}
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
              testId="competences-from-profile-remove-all-button"
            />
          )}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            text={t('tool.info-overview.no-competences-from-profile')}
            testId="competences-from-profile-empty-state"
          />
        </div>
      )}
      {hasOtherProfileData ? (
        <>
          <div className="mt-6 text-heading-4" data-testid="other-data-from-profile-title">
            {t('tool.info-overview.other-data-from-profile')}
          </div>
          <div className="mb-4 font-arial text-body-sm text-secondary-gray">
            {t('tool.info-overview.other-data-from-profile-description')}
          </div>
          <div className="flex flex-col gap-4">
            {mappedKuvaukset
              .filter((kuvaus) => kuvaus.data.teksti[language])
              .map((teksti) => (
                <FreeFormText
                  key={teksti.key}
                  description={teksti.data.teksti[language]}
                  onChange={() => setKuvaukset(mappedKuvaukset.filter((k) => k.key !== teksti.key).map((k) => k.data))}
                  testId={`${teksti.key}`}
                />
              ))}

            {osaamisetVapaateksti?.[language] && (
              <FreeFormText
                description={osaamisetVapaateksti[language]}
                onChange={() => setOsaamisetVapaateksti(undefined)}
                testId="osaamiset-vapaateksti"
              />
            )}

            {kiinnostuksetVapaateksti?.[language] && (
              <FreeFormText
                description={kiinnostuksetVapaateksti[language]}
                onChange={() => setKiinnostuksetVapaateksti(undefined)}
                testId="kiinnostukset-vapaateksti"
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
export default CategorizedCompetenceTagList;

import JakaumaList from '@/components/JakaumaList/JakaumaList';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import { type LoaderData } from '@/routes/EducationOpportunity/loader';
import { JakaumaKey } from '@/routes/types';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

const EducationOpportunity = () => {
  const { jakaumat, koulutusmahdollisuus, osaamiset, isLoggedIn } = useLoaderData<LoaderData>();
  const { tiivistelma, kuvaus, koulutukset, kesto } = koulutusmahdollisuus;

  const {
    t,
    i18n: { language },
  } = useTranslation();
  const sortedCompetences = React.useMemo(
    () => [...(osaamiset ?? [])].sort(sortByProperty(`nimi.${language}`)),
    [osaamiset, language],
  );
  const codesAsValue: JakaumaKey[] = ['kunta', 'koulutusala', 'opetustapa', 'aika'];

  const sections = [
    tiivistelma
      ? {
          navTitle: t('text-summary'),
          hasAiContent: true,
          content: <p className="text-body-md font-arial">{getLocalizedText(koulutusmahdollisuus?.tiivistelma)}</p>,
        }
      : undefined,
    {
      navTitle: t('description'),
      hasAiContent: true,
      content: <p className="text-body-md font-arial">{getLocalizedText(kuvaus)}</p>,
    },
    kesto
      ? {
          navTitle: t('duration'),
          content: <p className="text-body-md font-arial">{JSON.stringify(kesto)}</p>,
          showInDevOnly: true,
        }
      : undefined,
    koulutukset
      ? {
          navTitle: t('educations'),
          content: (
            <ul className="flex flex-wrap gap-4">
              {koulutukset.map((k) => (
                <li key={k.oid}>{getLocalizedText(k.nimi)}</li>
              ))}
            </ul>
          ),
          showInDevOnly: true,
        }
      : undefined,
    {
      navTitle: t('education-opportunity.specific-professional-competences.title'),
      content: (
        <div className="flex flex-wrap gap-4">
          {sortedCompetences.map((competence) => (
            <Tag
              label={getLocalizedText(competence.nimi)}
              title={getLocalizedText(competence.kuvaus)}
              key={competence.uri}
              variant="presentation"
            />
          ))}
        </div>
      ),
    },
    {
      navTitle: t('more-information'),
      showInDevOnly: true,
      content: (
        <div className="grid w-full grow grid-cols-2 gap-6">
          {(Object.keys(jakaumat) as JakaumaKey[])
            .filter((key) => !['osaaminen', 'ammatti'].includes(key))
            .map((key) => (
              <JakaumaList codesAsValue={codesAsValue} jakaumat={jakaumat} key={key} name={key} />
            ))}
        </div>
      ),
    },
  ].filter(Boolean) as OpportunityDetailsSection[];

  return (
    <OpportunityDetails
      data={koulutusmahdollisuus}
      isLoggedIn={isLoggedIn}
      tyyppi="KOULUTUSMAHDOLLISUUS"
      sections={sections}
      showAiInfoInTitle
    />
  );
};

export default EducationOpportunity;

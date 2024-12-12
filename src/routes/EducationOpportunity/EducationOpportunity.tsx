import { components } from '@/api/schema';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import { type LoaderData } from '@/routes/EducationOpportunity/loader';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

const EducationOpportunity = () => {
  const { koulutusmahdollisuus, osaamiset, isLoggedIn } = useLoaderData<LoaderData>();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const sortedCompetences = React.useMemo(
    () => [...(osaamiset ?? [])].sort(sortByProperty(`nimi.${language}`)),
    [osaamiset, language],
  );
  const sections: OpportunityDetailsSection[] = [
    {
      navTitle: t('description'),
      content: <p className="text-body-md font-arial">{getLocalizedText(koulutusmahdollisuus?.kuvaus)}</p>,
    },
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
  ];

  return (
    <OpportunityDetails
      data={koulutusmahdollisuus as components['schemas']['KoulutusmahdollisuusFullDto']}
      isLoggedIn={isLoggedIn}
      tyyppi="KOULUTUSMAHDOLLISUUS"
      sections={sections}
    />
  );
};

export default EducationOpportunity;

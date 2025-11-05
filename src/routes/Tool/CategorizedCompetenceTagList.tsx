import AddedTags from '@/components/OsaamisSuosittelija/AddedTags';
import type { OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { Button, EmptyState } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

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
      <Button variant="plain" onClick={onChange} label={t('delete')} />
    </div>
  );
};

const CompetenceCategory = ({
  osaamiset,
  onChange,
  lahdeTyyppi,
}: {
  osaamiset: OsaaminenValue[];
  onChange: (id: string) => () => void;
  lahdeTyyppi?: OsaaminenLahdeTyyppi;
}) => {
  return <AddedTags osaamiset={osaamiset} onClick={onChange} lahdetyyppi={lahdeTyyppi} />;
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
    osaamiset,
    osaamisetVapaateksti,
    kiinnostukset,
    kiinnostuksetVapaateksti,
    setOsaamiset,
    setOsaamisetVapaateksti,
    setKiinnostukset,
    setKiinnostuksetVapaateksti,
  } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      osaamisetVapaateksti: state.osaamisetVapaateksti,
      kiinnostukset: state.kiinnostukset,
      kiinnostuksetVapaateksti: state.kiinnostuksetVapaateksti,
      setOsaamiset: state.setOsaamiset,
      setOsaamisetVapaateksti: state.setOsaamisetVapaateksti,
      setKiinnostukset: state.setKiinnostukset,
      setKiinnostuksetVapaateksti: state.setKiinnostuksetVapaateksti,
    })),
  );

  const filterByType = (type: OsaaminenLahdeTyyppi) => (val: OsaaminenValue) => val.tyyppi === type;
  const filterOsaaminenById = (id: string) => (value: OsaaminenValue) => value.id !== id;
  const mappedInterests = React.useMemo(() => kiinnostukset.filter(filterByType('KARTOITETTU')), [kiinnostukset]);
  const mappedCompetences = React.useMemo(() => osaamiset.filter(filterByType('KARTOITETTU')), [osaamiset]);

  const removeCompetenceByType = (type: 'osaaminen' | 'kiinnostus') => (id: string) => () => {
    const data = type === 'kiinnostus' ? kiinnostukset : osaamiset;
    const setData = type === 'kiinnostus' ? setKiinnostukset : setOsaamiset;
    setData(data.filter(filterOsaaminenById(id)));
  };
  const removeOsaaminen = removeCompetenceByType('osaaminen');
  const removeKiinnostus = removeCompetenceByType('kiinnostus');
  const hasMappedCompetences = mappedCompetences.length > 0 || mappedInterests.length > 0;
  const profileTypes: OsaaminenLahdeTyyppi[] = ['KIINNOSTUS', 'TOIMENKUVA', 'KOULUTUS', 'PATEVYYS', 'MUU_OSAAMINEN'];
  const combinedData = [...osaamiset, ...kiinnostukset];
  const hasProfileCompetences = combinedData.filter((o) => o.tyyppi && profileTypes.includes(o.tyyppi)).length > 0;
  const hasOtherData = osaamisetVapaateksti?.[language] || kiinnostuksetVapaateksti?.[language];
  const mappedCompetencesId = React.useId();
  const competencesFromProfileId = React.useId();

  return (
    <div className="flex flex-col">
      <div id={mappedCompetencesId} className="text-heading-4 mt-5">
        {t('tool.info-overview.mapped-competences')}
      </div>
      <div className="flex flex-col gap-4 mb-6">
        {hasMappedCompetences ? (
          <>
            <div className="font-arial text-body-sm text-secondary-gray">{t('tool.remove-competence-help')}</div>
            <ul
              data-testid="osaamissuosittelija-selected-competences"
              aria-labelledby={mappedCompetencesId}
              className="gap-3 flex flex-wrap"
            >
              {mappedCompetences.length > 0 && (
                <CompetenceCategory osaamiset={mappedCompetences} onChange={removeOsaaminen} />
              )}
              {mappedInterests.length > 0 && (
                <CompetenceCategory osaamiset={mappedInterests} onChange={removeKiinnostus} lahdeTyyppi="KIINNOSTUS" />
              )}
            </ul>
            <Button
              variant="plain"
              onClick={() => {
                setOsaamiset(osaamiset.filter((o) => o.tyyppi !== 'KARTOITETTU'));
                setKiinnostukset(kiinnostukset.filter((o) => o.tyyppi !== 'KARTOITETTU'));
              }}
              label={t('delete')}
              data-testid="delete-selected-competences-button"
            />
          </>
        ) : (
          <div className="mt-4">
            <EmptyState text={t('tool.info-overview.no-mapped-competences')} />
          </div>
        )}
      </div>
      <div id={competencesFromProfileId} className="text-heading-4">
        {t('tool.info-overview.data-from-profile')}
      </div>
      {hasProfileCompetences ? (
        <div className="flex flex-col gap-4">
          <div className="font-arial text-body-sm text-secondary-gray">{t('tool.remove-competence-help')}</div>
          <ul className="gap-3 flex flex-wrap" aria-labelledby={competencesFromProfileId}>
            {profileTypes
              .filter((type) => combinedData.some((o) => o.tyyppi === type))
              .map((type) => (
                <CompetenceCategory
                  key={type}
                  osaamiset={combinedData.filter(filterByType(type))}
                  onChange={type === 'KIINNOSTUS' ? removeKiinnostus : removeOsaaminen}
                />
              ))}
          </ul>
          <Button
            variant="plain"
            onClick={() => {
              setOsaamiset(osaamiset.filter((o) => o.tyyppi && ![...profileTypes, 'KIINNOSTUS'].includes(o.tyyppi)));
              setKiinnostukset(
                kiinnostukset.filter((o) => o.tyyppi && ![...profileTypes, 'KIINNOSTUS'].includes(o.tyyppi)),
              );
            }}
            label={t('delete')}
          />
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState text={t('tool.info-overview.no-competences-from-profile')} />
        </div>
      )}
      {hasOtherData ? (
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

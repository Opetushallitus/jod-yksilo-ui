import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type GroupByProps, MobileFilterButton } from './constants';

export const GroupByAlphabet = ({
  locale,
  osaamiset,
  isOsaaminenVisible,
  mobileFilterOpenerComponent,
}: GroupByProps & MobileFilterButton) => {
  const { t } = useTranslation();

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ';

  const letterHasOsaaminen = (letter: string) =>
    osaamiset.some(
      (val) =>
        isOsaaminenVisible(val.lahde.tyyppi, val.lahde.id) &&
        val.osaaminen.nimi[locale]?.toLocaleUpperCase().startsWith(letter),
    );

  const getOsaaminenByLetter = React.useCallback(
    (letter: string) =>
      osaamiset
        .filter((val) => isOsaaminenVisible(val.lahde.tyyppi, val.lahde.id))
        .filter((val) => val.osaaminen.nimi[locale]?.toLocaleUpperCase().startsWith(letter))
        .sort((a, b) => a.osaaminen.nimi[locale].localeCompare(b.osaaminen.nimi[locale])),
    [osaamiset, isOsaaminenVisible, locale],
  );
  return (
    <>
      <div className="flex flex-row justify-between gap-5">
        <h2 className="my-6 text-heading-2">{t('my-competences-alphabetically')}</h2>
        {mobileFilterOpenerComponent}
      </div>
      {Array.from(alphabet)
        .filter(letterHasOsaaminen)
        .map((letter) => {
          return (
            <React.Fragment key={letter}>
              <div className="mb-5 mt-8 pb-3 border-b border-border-gray text-heading-3">{letter}</div>
              <div className="flex flex-wrap gap-3">
                {getOsaaminenByLetter(letter).map((val) => {
                  const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
                  const tooltip = val.osaaminen.kuvaus[locale];
                  return (
                    <Tag
                      label={label}
                      tooltip={tooltip}
                      key={val.id}
                      variant="presentation"
                      sourceType={OSAAMINEN_COLOR_MAP[val.lahde.tyyppi]}
                    />
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
    </>
  );
};

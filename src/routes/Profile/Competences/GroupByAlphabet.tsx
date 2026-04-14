import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';
import { removeDuplicatesByKey } from '@/utils';
import { Accordion, Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GroupByProps, MobileFilterButton } from './constants';

interface LetterSectionProps extends Omit<GroupByProps, 'filterKeys' | 'filters'> {
  letter: string;
}
const LetterSection = ({ letter, osaamiset, isOsaaminenVisible, locale }: LetterSectionProps & { letter: string }) => {
  const { t } = useTranslation();
  const getOsaaminenByLetter = React.useCallback(
    (letter: string) =>
      removeDuplicatesByKey(osaamiset, (o) => o.osaaminen.uri + o.lahde.tyyppi) // Remove duplicates per lähdetyyppi
        .filter((val) => isOsaaminenVisible(val.lahde.tyyppi, val.lahde.id))
        .filter((val) => val.osaaminen.nimi[locale]?.toLocaleUpperCase().startsWith(letter))
        .sort((a, b) => a.osaaminen.nimi[locale].localeCompare(b.osaaminen.nimi[locale])),
    [osaamiset, isOsaaminenVisible, locale],
  );
  const data = getOsaaminenByLetter(letter);

  const { ref, handleKeyDown } = useArrowKeyControls(data);
  return (
    <Accordion key={letter} title={letter} underline ariaLabel={letter} className="pt-6">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <ul className="flex flex-wrap gap-3 mt-4" ref={ref} onKeyDown={handleKeyDown}>
        {data.map((val) => {
          const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
          const tooltip = val.osaaminen.kuvaus[locale];
          return (
            <li key={val.id} className="max-w-full">
              <Tag
                label={label}
                tooltip={tooltip}
                screenReaderTooltip={t('description-for', { description: tooltip })}
                variant="presentation"
                sourceType={OSAAMINEN_COLOR_MAP[val.lahde.tyyppi]}
              />
            </li>
          );
        })}
      </ul>
    </Accordion>
  );
};

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

  return (
    <div className="pb-9">
      <div className="flex flex-row justify-between gap-5">
        <h2 className="mt-6 text-heading-2-mobile sm:text-heading-2">{t('my-competences-alphabetically')}</h2>
        {mobileFilterOpenerComponent}
      </div>
      {Array.from(alphabet)
        .filter(letterHasOsaaminen)
        .map((letter) => (
          <LetterSection
            key={letter}
            letter={letter}
            osaamiset={osaamiset}
            isOsaaminenVisible={isOsaaminenVisible}
            locale={locale}
          />
        ))}
    </div>
  );
};

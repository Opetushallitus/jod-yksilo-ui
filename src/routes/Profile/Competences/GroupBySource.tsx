import { OSAAMINEN_COLOR_MAP } from '@/constants';
import { Tag } from '@jod/design-system';
import { t } from 'i18next';
import React from 'react';
import { GroupByProps, MobileFilterButton, groupByHeaderClasses } from './constants';

export const GroupBySource = ({
  filters,
  filterKeys,
  locale,
  osaamiset,
  isOsaaminenVisible,
  mobileFilterOpenerComponent,
}: GroupByProps & MobileFilterButton) => {
  return (
    <>
      <div className="flex flex-row justify-between gap-5">
        <h2 className="my-6 text-heading-2">{t('my-competences-by-sources')}</h2>
        {mobileFilterOpenerComponent}
      </div>

      {filterKeys.map((sourceType) => {
        return (
          Array.isArray(filters[sourceType]) &&
          filters[sourceType].some((filter) => filter.checked) && (
            <React.Fragment key={sourceType}>
              <div className={groupByHeaderClasses}>{t(`my-competences.by-${sourceType}`)}</div>
              <div className="flex flex-wrap gap-4">
                {osaamiset.map((val) => {
                  const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
                  const title = val.osaaminen.kuvaus[locale];
                  return (
                    val.lahde.tyyppi === sourceType &&
                    isOsaaminenVisible(sourceType, val.lahde.id) && (
                      <Tag
                        label={label}
                        title={title}
                        key={val.id}
                        variant="presentation"
                        sourceType={OSAAMINEN_COLOR_MAP[val.lahde.tyyppi]}
                      />
                    )
                  );
                })}
              </div>
            </React.Fragment>
          )
        );
      })}
    </>
  );
};

import { ConfirmDialog, Tag } from '@jod/design-system';
import { t } from 'i18next';
import React from 'react';
import { groupByHeaderClasses, osaaminenColorMap, type GroupByProps } from './constants';

export const GroupBySource = ({
  filters,
  filterKeys,
  locale,
  osaamiset,
  deleteOsaaminen,
  isOsaaminenVisible,
}: GroupByProps) => {
  return (
    <>
      <h2 className="my-6 text-heading-2">Osaamiseni lähteiden mukaan</h2>
      {filterKeys.map((key) => {
        return (
          Array.isArray(filters[key]) &&
          filters[key]!.some((filter) => filter.checked) && (
            <React.Fragment key={key}>
              <div className={groupByHeaderClasses}>{t(`my-competences.by-${key}`)}</div>
              <div className="flex flex-wrap gap-4">
                {osaamiset.map((val) => {
                  const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
                  return (
                    isOsaaminenVisible(key, val.lahde.id) && (
                      <ConfirmDialog
                        key={val.id}
                        title="Poista osaaminen"
                        onConfirm={() => void deleteOsaaminen(val.id)}
                        confirmText={t('delete')}
                        cancelText={t('cancel')}
                        description="Haluatko varmasti poistaa osaamisen?"
                      >
                        {(showDialog: () => void) => (
                          <Tag
                            label={label}
                            key={val.id}
                            variant="added"
                            onClick={showDialog}
                            color={osaaminenColorMap[val.lahde.tyyppi]}
                          />
                        )}
                      </ConfirmDialog>
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

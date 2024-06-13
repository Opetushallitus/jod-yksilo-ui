import { Accordion, ConfirmDialog, Tag } from '@jod/design-system';
import { t } from 'i18next';
import React from 'react';
import type { GroupByProps } from './constants';

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
      <h2 className="mb-6 text-heading-3">Osaamiseni lähteiden mukaan</h2>
      {filterKeys.map((key) => {
        return (
          Array.isArray(filters[key]) &&
          filters[key]!.some((filter) => filter.checked) && (
            <React.Fragment key={key}>
              <Accordion
                title={
                  <span className="truncate text-heading-5 text-secondary-gray">{t(`my-competences.by-${key}`)}</span>
                }
                expandMoreText={t('expand-more')}
                expandLessText={t('expand-less')}
                lang={locale}
              >
                <span className="mb-5 mt-3 flex border border-b-2 border-inactive-gray"></span>
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
                            <Tag label={label} key={val.id} variant="added" onClick={showDialog} />
                          )}
                        </ConfirmDialog>
                      )
                    );
                  })}
                </div>
              </Accordion>
              <div className="mb-6" />
            </React.Fragment>
          )
        );
      })}
    </>
  );
};

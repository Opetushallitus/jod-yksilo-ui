import { Accordion, ConfirmDialog, Tag } from '@jod/design-system';
import { t } from 'i18next';
import React from 'react';
import { GroupByProps } from './constants';

export const GroupByAlphabet = ({ locale, osaamiset, deleteOsaaminen, isOsaaminenVisible }: GroupByProps) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzåäö';

  const letterHasOsaaminen = (letter: string) =>
    osaamiset.some(
      (val) =>
        isOsaaminenVisible(val.lahde.tyyppi, val.lahde.id) &&
        val.osaaminen.nimi[locale]?.toLowerCase().startsWith(letter),
    );

  const getOsaaminenByLetter = React.useCallback(
    (letter: string) =>
      osaamiset
        .filter((val) => isOsaaminenVisible(val.lahde.tyyppi, val.lahde.id))
        .filter((val) => val.osaaminen.nimi[locale]?.toLowerCase().startsWith(letter))
        .sort((a, b) => a.osaaminen.nimi[locale].localeCompare(b.osaaminen.nimi[locale])),
    [osaamiset, isOsaaminenVisible, locale],
  );
  return (
    <>
      <h2 className="mb-6 text-heading-3">Osaamiseni aakkosjärjestyksessä</h2>
      {Array.from(alphabet)
        .filter(letterHasOsaaminen)
        .map((letter) => {
          return (
            <div className="mb-4" key={letter}>
              <Accordion
                expandMoreText={t('expand-more')}
                expandLessText={t('expand-less')}
                lang={locale}
                title={<span className="truncate text-heading-5 capitalize text-secondary-gray">{letter}</span>}
              >
                <span className="mb-5 mt-3 flex border border-b-2 border-inactive-gray"></span>
                <div className="flex flex-wrap gap-4">
                  {getOsaaminenByLetter(letter).map((val) => {
                    const label = val.osaaminen.nimi[locale] ?? val.osaaminen.uri;
                    return (
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
                    );
                  })}
                </div>
              </Accordion>
            </div>
          );
        })}
    </>
  );
};

import { ConfirmDialog, Tag } from '@jod/design-system';
import { t } from 'i18next';
import React from 'react';
import { GroupByProps, groupByHeaderClasses, osaaminenColorMap } from './constants';

export const GroupByAlphabet = ({ locale, osaamiset, deleteOsaaminen, isOsaaminenVisible }: GroupByProps) => {
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
      <h2 className="mb-6 text-heading-2 font-poppins">Osaamiseni aakkosjärjestyksessä</h2>
      {Array.from(alphabet)
        .filter(letterHasOsaaminen)
        .map((letter) => {
          return (
            <React.Fragment key={letter}>
              <div className={groupByHeaderClasses}>{letter}</div>
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
                        <Tag
                          label={label}
                          key={val.id}
                          variant="added"
                          onClick={showDialog}
                          color={osaaminenColorMap[val.lahde.tyyppi]}
                        />
                      )}
                    </ConfirmDialog>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
    </>
  );
};

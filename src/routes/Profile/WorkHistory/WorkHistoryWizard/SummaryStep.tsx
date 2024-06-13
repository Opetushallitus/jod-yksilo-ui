import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { WorkHistoryTable, WorkHistoryTableRow } from '../WorkHistoryTable';
import { Toimenkuva, getWorkHistoryTableRows } from '../utils';
import { type WorkHistoryForm } from './utils';

const SummaryStep = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<WorkHistoryForm>();
  const [rows, setRows] = React.useState<WorkHistoryTableRow[]>([]);

  React.useEffect(() => {
    const tyopaikka = watch();
    setRows(
      getWorkHistoryTableRows([
        {
          nimi: { fi: tyopaikka.nimi },
          toimenkuvat: tyopaikka.toimenkuvat.map(
            (toimenkuva) =>
              ({
                nimi: {
                  fi: toimenkuva.nimi,
                },
                alkuPvm: toimenkuva.alkuPvm,
                loppuPvm: toimenkuva.loppuPvm,
                osaamiset: toimenkuva.osaamiset.map((osaaminen) => osaaminen.id),
              }) as Toimenkuva,
          ),
        },
      ]),
    );
  }, [watch]);

  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('work-history.summary')}</h2>
      <p className="mb-7 text-body-sm text-primary-gray sm:mb-9">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <WorkHistoryTable rows={rows} />
    </>
  );
};

export default SummaryStep;

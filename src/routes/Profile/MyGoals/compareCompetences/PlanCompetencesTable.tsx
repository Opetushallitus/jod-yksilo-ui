import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { planLetter } from '@/routes/Profile/MyGoals/planLetterUtil';
import { isDefined } from '@/utils';
import { Button, cx } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlanCompetenceRow, PlanCompetencesTableRowData } from './PlanCompetenceRow';

const ROW_LIMIT = 10;
export type PlanWithCustomKey = components['schemas']['PolunSuunnitelmaDto'] & { displayKey: string };
interface PlanCompetencesTableProps {
  goal: components['schemas']['TavoiteDto'];
}

export const PlanCompetencesTable = ({ goal }: PlanCompetencesTableProps) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = React.useState(false);
  const plans = React.useMemo(() => {
    if (!goal.suunnitelmat) {
      return [];
    }
    // Recalculate plans only when goal changes
    return goal?.suunnitelmat?.map((s, index) => {
      const key = planLetter(index);
      return { ...s, displayKey: key } as PlanWithCustomKey;
    });
  }, [goal]);
  const [vaaditutOsaamiset, setVaaditutOsaamiset] = React.useState<PlanCompetencesTableRowData[]>([]);
  React.useEffect(() => {
    const fetchOsaamiset = async () => {
      const { data } = await client.GET('/api/profiili/osaamiset');
      if (!data) {
        return;
      }
      const omatOsaamisetUris = new Set(data.map((o) => o?.osaaminen?.uri));

      const response = await osaamiset.combine(
        goal?.osaamiset,
        (value) => value,
        (_, osaaminen) => ({
          ...osaaminen,
          profiili: omatOsaamisetUris.has(osaaminen.uri),
          // eslint-disable-next-line sonarjs/no-nested-functions
          plans: plans.map((p) => p.osaamiset?.includes(osaaminen.uri)).filter(isDefined),
        }),
      );
      setVaaditutOsaamiset(response);
    };
    fetchOsaamiset();
  }, [goal.osaamiset, plans]);

  return (
    <div className="mt-6 overflow-x-auto max-w-full p-2">
      <h3 className={'text-heading-3'}>{t('profile.my-goals.competence-compare')}</h3>
      <table
        className="font-arial mt-3"
        data-testid="compare-competences-table"
        aria-label={t('profile.my-goals.competence-compare')}
      >
        <thead>
          <tr className="border-b border-inactive-gray text-form-label">
            <th scope="col" className="text-left pl-5 pr-7 pb-3">
              {t('competence')}
            </th>
            <th scope="col" className="text-center whitespace-nowrap pr-5 pb-3">
              {t('profile.my-goals.own-competences')}
            </th>
            {plans.map((plan) => {
              return (
                <th scope="col" key={`th-${plan.id}`} className="text-center whitespace-nowrap pr-5 pb-3">
                  {plan.displayKey}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {vaaditutOsaamiset.map((row, index) => (
            <PlanCompetenceRow
              key={row.uri}
              row={row}
              className={cx('odd:bg-bg-gray-2 even:bg-bg-gray', {
                'hidden print:block': index >= ROW_LIMIT && !showAll,
              })}
            />
          ))}
        </tbody>
      </table>
      {vaaditutOsaamiset.length > ROW_LIMIT && (
        <Button
          label={showAll ? t('show-less') : t('show-all')}
          onClick={() => setShowAll((previous) => !previous)}
          variant="plain"
          className="mt-6 print:hidden"
          testId="compare-competences-toggle"
        />
      )}
    </div>
  );
};

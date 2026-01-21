import { client } from '@/api/client.ts';
import { osaamiset as osaamisetService } from '@/api/osaamiset.ts';
import type { components } from '@/api/schema';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { KoulutusMahdollisuusFull } from '@/routes/Profile/MyGoals/addPlan/store/PlanOptionStoreModel.ts';
import type { KoulutusmahdollisuusJakaumat } from '@/routes/types';
import { getLocalizedText } from '@/utils';
import { Accordion, Tag } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

interface PlanOpportunityCardProps {
  mahdollisuus: KoulutusMahdollisuusFull;
  actionButtonContent?: React.ReactNode;
  matchValue?: number | string;
  matchLabel?: string;
}

const PlanOpportunityCard = React.memo(
  ({ mahdollisuus, actionButtonContent, matchLabel, matchValue }: PlanOpportunityCardProps) => {
    const [osaamiset, setOsaamiset] = React.useState<components['schemas']['OsaaminenDto'][]>([]);
    const { vaaditutOsaamiset } = addPlanStore(
      useShallow((state) => ({
        vaaditutOsaamiset: state.vaaditutOsaamiset,
      })),
    );
    const { t } = useTranslation();
    const { otsikko, kuvaus } = mahdollisuus;
    const missingOsaamisetUris = new Set(vaaditutOsaamiset.map((o) => o.uri));

    const fetchOsaamiset = () =>
      client
        .GET(`/api/koulutusmahdollisuudet/{id}`, {
          params: { path: { id: mahdollisuus.id } },
        })
        .then(({ data }) => {
          const jakaumat = (data?.jakaumat ?? []) as unknown as KoulutusmahdollisuusJakaumat;
          const mahdollisuusOsaamiset = (jakaumat.osaaminen.arvot ?? []).map((x) => x.arvo);
          if (mahdollisuusOsaamiset.length === 0) {
            return null;
          }
          const filteredUris = mahdollisuusOsaamiset.filter((uri) => missingOsaamisetUris.has(uri));
          return osaamisetService.find(filteredUris);
        })
        .then((data) => setOsaamiset(data ?? []));

    return (
      <div className="flex flex-col bg-white p-5 sm:p-6 rounded shadow-border">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            {matchValue !== undefined && matchLabel && (
              <div
                className="inline-flex items-center gap-2 p-3 text-white rounded-full select-none w-fit bg-secondary-3-dark"
                data-testid="opportunity-card-match"
              >
                <span className="text-heading-2-mobile">{matchValue}</span>
                <span className="text-heading-2-mobile font-arial">{matchLabel}</span>
              </div>
            )}
          </div>

          {actionButtonContent && <div className="ml-4">{actionButtonContent}</div>}
        </div>
        <span className="font-arial text-body-sm-mobile sm:text-body-sm leading-6 uppercase">
          {mahdollisuus.tyyppi == 'TUTKINTO'
            ? t(`opportunity-type.education.TUTKINTO`)
            : t(`opportunity-type.education.EI_TUTKINTO`)}
        </span>

        <Accordion title={getLocalizedText(otsikko)} initialState={false} fetchData={fetchOsaamiset}>
          <p className="font-arial text-body-md-mobile sm:text-body-md mb-4">{getLocalizedText(kuvaus)}</p>
          <ul className="flex flex-row flex-wrap gap-3">
            {osaamiset.map((osaaminen) => (
              <li key={osaaminen.uri} className="max-w-full">
                <Tag
                  label={getLocalizedText(osaaminen.nimi)}
                  tooltip={getLocalizedText(osaaminen.kuvaus)}
                  variant="presentation"
                  sourceType="koulutus"
                />
              </li>
            ))}
          </ul>
        </Accordion>
      </div>
    );
  },
);

PlanOpportunityCard.displayName = 'PlanOpportunityCard';
export default PlanOpportunityCard;

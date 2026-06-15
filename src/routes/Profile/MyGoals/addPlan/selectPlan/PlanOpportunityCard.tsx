import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Accordion, cx, Tag } from '@jod/design-system';

import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { TitleIcon } from '@/components/TitleIcon/TitleIcon';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore';
import { KoulutusMahdollisuusFull } from '@/routes/Profile/MyGoals/addPlan/store/PlanOptionStoreModel';
import type { KoulutusmahdollisuusJakaumat } from '@/routes/types';
import { getLocalizedText } from '@/utils';

interface PlanOpportunityCardProps {
  mahdollisuus: KoulutusMahdollisuusFull;
  actionButtonContent?: React.ReactNode;
  matchValue?: number | string;
  matchLabel?: string;
  selected?: boolean;
}

const PlanOpportunityCard = React.memo(
  ({ mahdollisuus, actionButtonContent, matchLabel, matchValue, selected }: PlanOpportunityCardProps) => {
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
          const mahdollisuusOsaamiset = (jakaumat.osaaminen?.arvot ?? []).map((x) => x.arvo);
          if (mahdollisuusOsaamiset.length === 0) {
            return null;
          }
          const filteredUris = mahdollisuusOsaamiset.filter((uri) => missingOsaamisetUris.has(uri));
          return osaamisetService.find(filteredUris);
        })
        .then((data) => setOsaamiset(data ?? []));

    const { ref, handleKeyDown } = useArrowKeyControls(osaamiset);

    return (
      <div
        className={cx('flex flex-col rounded bg-white p-5 shadow-border sm:p-6', {
          'border-4 border-primary-2 p-4 sm:p-[20px]': selected,
        })}
      >
        <div className="mb-4 flex flex-row justify-between gap-3 sm:items-start">
          {matchValue !== undefined && matchLabel && (
            <div
              className="tracking-wide inline-flex w-fit flex-col items-center select-none sm:flex-row sm:gap-2"
              data-testid="opportunity-card-match"
            >
              <span className="text-[1.875rem] text-accent sm:text-[2.125rem]">{matchValue}</span>
              <span className="font-semibold font-arial text-attrib-title">{matchLabel}</span>
            </div>
          )}

          {actionButtonContent && <div className="order-1 sm:order-2">{actionButtonContent}</div>}
        </div>
        <div className="flex flex-row gap-3">
          <div
            className={`flex aspect-square size-7 items-center justify-center rounded-full bg-primary-2-dark text-white sm:size-8 print:hidden`}
          >
            <TitleIcon mahdollisuusAlityyppi={mahdollisuus.tyyppi === 'EI_TUTKINTO' ? 'MUU_KOULUTUS' : 'TUTKINTO'} />
          </div>
          <span className="flex items-center font-arial text-body-sm-mobile leading-6 uppercase sm:text-body-sm">
            {mahdollisuus.tyyppi == 'TUTKINTO'
              ? t(`opportunity-type.education.TUTKINTO`)
              : t(`opportunity-type.education.EI_TUTKINTO`)}
          </span>
        </div>

        <Accordion
          title={getLocalizedText(otsikko)}
          titleClassName="text-primary-2-dark"
          initialState={false}
          fetchData={fetchOsaamiset}
          ellipsis={false}
          caretPosition="top"
        >
          <p className="mt-3 mb-4 font-arial text-body-md-mobile sm:text-body-md">{getLocalizedText(kuvaus)}</p>
          <ul
            className="flex flex-row flex-wrap gap-3"
            ref={ref}
            onKeyDown={handleKeyDown}
            aria-label={t('competences')}
          >
            {osaamiset.map((osaaminen) => (
              <li key={osaaminen.uri} className="max-w-full">
                <Tag
                  label={getLocalizedText(osaaminen.nimi)}
                  tooltip={getLocalizedText(osaaminen.kuvaus)}
                  screenReaderTooltip={t('description-for', { description: getLocalizedText(osaaminen.kuvaus) })}
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

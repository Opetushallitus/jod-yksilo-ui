import type { components } from '@/api/schema';
import { EducationOpportunityCard, JobOpportunityCard, type OpportunityCardProps } from '@/components';
import DeletePolkuButton from '@/components/DeletePolkuButton/DeletePolkuButton';
import { useEnvironment } from '@/hooks/useEnvironment';
import loader from '@/routes/Profile/MyGoals/loader';
import { usePaamaaratStore } from '@/stores/usePaamaaratStore';
import { getLocalizedText } from '@/utils';
import { Button } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import MyGoalsOpportunityCardMenu from './MyGoalsOpportunityCardMenu';
import TavoiteInput from './TavoiteInput';

interface MyGoalsSectionProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  paamaarat: components['schemas']['PaamaaraDto'][];
}
const MyGoalsSection = ({ title, description, icon, paamaarat }: MyGoalsSectionProps) => {
  const { t, i18n } = useTranslation();
  const { mahdollisuusDetails, upsertPaamaara } = usePaamaaratStore(
    useShallow((state) => ({ mahdollisuusDetails: state.mahdollisuusDetails, upsertPaamaara: state.upsertPaamaara })),
  );
  const { isPrd } = useEnvironment();
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const getMahdollisuusDetails = React.useCallback(
    (id: string) => mahdollisuusDetails.find((item) => item.id === id),
    [mahdollisuusDetails],
  );

  const removePolkuFromStore = React.useCallback(
    (paamaaraId?: string, suunnitelmaId?: string) => {
      if (!paamaaraId || !suunnitelmaId) {
        return;
      }

      const paamaara = paamaarat.find((paamaara) => paamaara.id === paamaaraId);

      if (paamaara) {
        upsertPaamaara({
          ...paamaara,
          suunnitelmat: paamaara.suunnitelmat?.filter((polku) => polku.id !== suunnitelmaId),
        });
      }
    },
    [paamaarat, upsertPaamaara],
  );

  return (
    <div className="mb-5">
      <div className="flex flex-row items-center gap-3">
        {icon}
        <h2 className="text-heading-2-mobile sm:text-heading-2">{title}</h2>
      </div>
      <p className={`${icon ? 'ml-8' : ''} text-body-lg font-medium mb-5`}>{description}</p>
      <div className="flex flex-col gap-5 mb-5">
        {paamaarat.map((pm, i) => {
          const { mahdollisuusId, mahdollisuusTyyppi, id } = pm;
          const details = getMahdollisuusDetails(mahdollisuusId);
          const menuId = id ?? `menu-${i}`;
          const cardBaseProps = {
            description: getLocalizedText(details?.tiivistelma),
            name: getLocalizedText(details?.otsikko),
            from: 'goal' as const,
            hideFavorite: true,
            menuId,
            menuContent: (
              <MyGoalsOpportunityCardMenu
                mahdollisuusId={mahdollisuusId}
                mahdollisuusTyyppi={mahdollisuusTyyppi}
                paamaaraId={id}
                menuId={menuId}
              />
            ),
          } as OpportunityCardProps;
          return details ? (
            <div key={pm.id ?? mahdollisuusId} className="flex flex-col gap-5 mb-9">
              {mahdollisuusTyyppi === 'TYOMAHDOLLISUUS' ? (
                <JobOpportunityCard
                  {...cardBaseProps}
                  to={`/${i18n.language}/${t('slugs.job-opportunity.index')}/${mahdollisuusId}`}
                  aineisto={details.aineisto}
                  ammattiryhma={details.ammattiryhma}
                  ammattiryhmaNimet={loaderData?.ammattiryhmaNimet}
                />
              ) : (
                <EducationOpportunityCard
                  {...cardBaseProps}
                  to={`/${i18n.language}/${t('slugs.education-opportunity.index')}/${mahdollisuusId}`}
                  tyyppi={details.tyyppi}
                  kesto={details.kesto}
                  yleisinKoulutusala={details.yleisinKoulutusala}
                />
              )}
              <TavoiteInput paamaara={pm} />
              {!isPrd && pm.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS' && (
                <>
                  <div className="text-form-label font-arial">{t('profile.my-goals.my-plan-towards-goal')}</div>
                  <div className="flex flex-col gap-3">
                    {pm.suunnitelmat?.map((polku) => (
                      <div className="flex flex-col gap-4" key={polku.id}>
                        <Link
                          to={`${pm.id}/${t('slugs.profile.path')}/${polku.id}`}
                          className="text-accent flex gap-2 text-heading-4"
                        >
                          {getLocalizedText(polku.nimi)} <JodArrowRight />
                        </Link>
                        <DeletePolkuButton
                          paamaaraId={pm.id}
                          suunnitelmaId={polku.id}
                          onDelete={() => removePolkuFromStore(pm.id, polku.id)}
                          name={polku.nimi}
                        />
                      </div>
                    ))}
                    <div className="mt-9">
                      <Button
                        variant="accent"
                        label={t('profile.my-goals.create-new-path-for-goal')}
                        // eslint-disable-next-line react/no-unstable-nested-components
                        LinkComponent={({ children }: { children: React.ReactNode }) => (
                          <Link
                            to={`${pm.id}/${t('slugs.profile.path')}`}
                            onClick={() => {
                              globalThis._paq?.push(['trackEvent', 'yksilo.Polku', 'Luonti']);
                            }}
                          >
                            {children}
                          </Link>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default MyGoalsSection;

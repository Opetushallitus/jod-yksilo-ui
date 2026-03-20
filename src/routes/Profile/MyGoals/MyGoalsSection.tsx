import type { components } from '@/api/schema';
import { OpportunityCard } from '@/components';
import { useModal } from '@/hooks/useModal';
import { GoalModal } from '@/routes/Profile/MyGoals/addGoal/GoalModal';
import AddPlanModal from '@/routes/Profile/MyGoals/addPlan/AddPlanModal';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore';
import { PlanCompetencesTable } from '@/routes/Profile/MyGoals/compareCompetences/PlanCompetencesTable';
import loader from '@/routes/Profile/MyGoals/loader';
import { PlanList } from '@/routes/Profile/MyGoals/PlanList';
import { getTypeSlug } from '@/routes/Profile/utils';
import { getMahdollisuusAlityyppi } from '@/routes/Tool/utils';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { getLocalizedText, sortByProperty } from '@/utils';
import { Accordion, Button, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useRevalidator } from 'react-router';
import { useShallow } from 'zustand/shallow';

interface MyGoalsSectionProps {
  tavoitteet: components['schemas']['TavoiteDto'][];
}

const MyGoalsSection = ({ tavoitteet }: MyGoalsSectionProps) => {
  const { t, i18n } = useTranslation();
  const { sm } = useMediaQueries();
  const revalidator = useRevalidator();

  const { mahdollisuusDetails, isLoading, upsertTavoite, deleteTavoite } = useTavoitteetStore(
    useShallow((state) => ({
      mahdollisuusDetails: state.mahdollisuusDetails,
      isLoading: state.isLoading,
      upsertTavoite: state.upsertTavoite,
      deleteTavoite: state.deleteTavoite,
    })),
  );

  const { showDialog, showModal } = useModal();
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const getMahdollisuusDetails = React.useCallback(
    (id?: string) => (id ? mahdollisuusDetails.find((item) => item.id === id) : undefined),
    [mahdollisuusDetails],
  );

  const removeSuunnitelmaFromStore = React.useCallback(
    (tavoiteId?: string, suunnitelmaId?: string) => {
      if (!tavoiteId || !suunnitelmaId) return;
      const tavoite = tavoitteet.find((t) => t.id === tavoiteId);
      if (tavoite) {
        upsertTavoite({
          ...tavoite,
          suunnitelmat: tavoite.suunnitelmat?.filter((s) => s?.id !== suunnitelmaId).sort(sortByProperty('luotu')),
        });
      }
    },
    [tavoitteet, upsertTavoite],
  );

  const setTavoite = addPlanStore((state) => state.setTavoite);

  return (
    <div className="mb-5">
      <div className="flex flex-col mb-5 gap-6">
        {tavoitteet.map((tavoite, i) => {
          const { mahdollisuusId, mahdollisuusTyyppi } = tavoite;
          const details = getMahdollisuusDetails(mahdollisuusId);
          const id = tavoite.id ?? mahdollisuusId ?? i;
          const triggerId = `accordion-header-${id}`;
          const contentId = `accordion-content-${id}`;

          return (
            <div key={id} className="flex flex-col">
              <Accordion
                triggerId={triggerId}
                ariaControls={contentId}
                initialState={i === 0} // Open the first accordion by default
                title={getLocalizedText(tavoite.tavoite)}
                collapsedContent={
                  <div className="flex flex-col mt-2">
                    <p className="text-primary-gray">{getLocalizedText(tavoite.kuvaus)}</p>
                    <p className="text-secondary-gray sm:text-body-sm font-semibold">
                      {t('profile.my-goals.n-plans', { count: tavoite.suunnitelmat?.length ?? 0 })}
                    </p>
                  </div>
                }
              >
                <section id={contentId} className="p-4">
                  <p className="text-primary-gray pb-4 -ml-4 -mt-2">{getLocalizedText(tavoite.kuvaus)}</p>
                  {details && mahdollisuusTyyppi && (
                    <>
                      <OpportunityCard
                        to={`/${i18n.language}/${getTypeSlug(mahdollisuusTyyppi)}/${mahdollisuusId ?? ''}`}
                        description={getLocalizedText(details.tiivistelma)}
                        from="goal"
                        ammattiryhma={details.ammattiryhma}
                        ammattiryhmaNimet={loaderData?.ammattiryhmaNimet}
                        name={getLocalizedText(details.otsikko)}
                        mahdollisuusTyyppi={mahdollisuusTyyppi}
                        mahdollisuusAlityyppi={getMahdollisuusAlityyppi(details)}
                        kesto={details.kesto}
                        yleisinKoulutusala={details.yleisinKoulutusala}
                        headingLevel="h3"
                        hideFavorite
                      />
                      <PlanList
                        goal={tavoite}
                        language={i18n.language}
                        removeSuunnitelmaFromStore={removeSuunnitelmaFromStore}
                      />
                    </>
                  )}

                  <div className="mt-9 flex flex-col items-start gap-3">
                    <Button
                      variant="white"
                      ariaHaspopup="dialog"
                      size={sm ? 'lg' : 'sm'}
                      onClick={() => {
                        setTavoite(tavoite);
                        showModal(AddPlanModal);
                      }}
                      disabled={isLoading}
                      label={t('profile.my-goals.add-new-plan-for-goal')}
                    />
                    <PlanCompetencesTable goal={tavoite} />

                    <div className="w-full flex justify-between">
                      <Button
                        variant="white"
                        ariaHaspopup="dialog"
                        size={sm ? 'lg' : 'sm'}
                        onClick={() => {
                          setTavoite(tavoite);
                          showModal(GoalModal, { mode: 'UPDATE', tavoite: tavoite });
                        }}
                        disabled={isLoading}
                        label={sm ? t('profile.my-goals.modify-goal') : t('edit')}
                      />
                      <Button
                        label={t('profile.my-goals.delete-goal')}
                        variant="white-delete"
                        size={sm ? 'lg' : 'sm'}
                        ariaHaspopup="dialog"
                        onClick={() => {
                          showDialog({
                            title: t('profile.my-goals.delete-goal'),
                            description: t('profile.my-goals.delete-goal-description'),
                            onConfirm: async () => {
                              await deleteTavoite(tavoite.id!);
                              await revalidator.revalidate();
                            },
                          });
                        }}
                        disabled={!tavoite.id || isLoading}
                        testId="goals-delete"
                      />
                    </div>
                  </div>
                </section>
              </Accordion>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyGoalsSection;

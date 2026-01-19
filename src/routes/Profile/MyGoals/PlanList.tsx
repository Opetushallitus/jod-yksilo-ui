import type { components } from '@/api/schema';
import { useModal } from '@/hooks/useModal';
import DeleteSuunnitelmaButton from '@/routes/Profile/MyGoals/DeleteSuunnitelmaButton';
import { planLetter, planNumberPrefix } from '@/routes/Profile/MyGoals/planLetterUtil';
import { getLocalizedText } from '@/utils';
import { Accordion, Button, EmptyState, useMediaQueries } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import AddOrEditCustomPlanModal from './addPlan/customPlan/AddOrEditCustomPlanModal';

export interface PlanListProps {
  goal: components['schemas']['TavoiteDto'];
  language: string;
  removeSuunnitelmaFromStore: (tavoiteId: string, suunnitelmaId: string) => void;
}

export const PlanList = ({ goal, language, removeSuunnitelmaFromStore }: PlanListProps) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { showModal } = useModal();
  const { sm } = useMediaQueries();
  const { t } = useTranslation();
  React.useEffect(() => {
    const handleResize = () => {
      setIsOpen(!sm);
    };
    handleResize();
    globalThis.addEventListener('resize', handleResize);
    return () => globalThis.removeEventListener('resize', handleResize);
  }, [sm]);

  const accordionId = `suunnitelmat-${goal.id}`;
  const contentId = `suunnitelmat-${goal.id}-content`;
  const title = t('profile.my-goals.my-plan-towards-goal');
  const emptyPlans = (
    <div className="w-auto">
      <EmptyState text={t('profile.my-goals.plan_zero')} />
    </div>
  );
  const divider = <div className="border-b border-border-gray" />;

  const planPrefix = (index: number): React.JSX.Element => {
    const numberPrefix = planNumberPrefix(index);
    const letter = planLetter(index);
    return (
      <span className="text-black">
        {numberPrefix && numberPrefix > 0 ? numberPrefix : ''}
        {letter}:
      </span>
    );
  };
  return (
    <div className="mt-8">
      <Accordion
        ariaLabel={title}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        triggerId={accordionId}
        ariaControls={contentId}
        title={<h3 className="text-heading-3">{title}</h3>}
      >
        <section aria-labelledby={accordionId} id={contentId}>
          <div className="flex flex-col gap-3 mt-2">
            {goal.suunnitelmat?.length === 0 && emptyPlans}
            {goal.suunnitelmat?.map((s, index) => {
              const description = getLocalizedText(s.kuvaus);

              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center justify-between gap-4">
                    {/* Custom plan */}
                    {!s.koulutusmahdollisuusId && (
                      <div>
                        <p className="text-heading-4 text-accent inline-flex gap-3">
                          <span>{planPrefix(index)}</span>
                          <span>{getLocalizedText(s.nimi)}</span>
                        </p>
                        {description && <p className="text-body-sm mt-2 text-primary-gray">{description}</p>}
                      </div>
                    )}
                    {/* Non-custom plan */}
                    {s.koulutusmahdollisuusId && (
                      <Link
                        to={`/${language}/${t('slugs.education-opportunity.index')}/${s.koulutusmahdollisuusId}`}
                        className="text-accent flex gap-2 text-heading-4 truncate max-w-[80%]"
                      >
                        <>
                          {planPrefix(index)}
                          {getLocalizedText(s.nimi)}
                          <JodArrowRight />
                        </>
                      </Link>
                    )}

                    <div className="flex gap-2">
                      {!s.koulutusmahdollisuusId && (
                        <Button
                          label={t('edit')}
                          onClick={() => {
                            showModal(AddOrEditCustomPlanModal, { tavoiteId: goal.id, suunnitelmaId: s.id });
                          }}
                          variant="white"
                        />
                      )}

                      <DeleteSuunnitelmaButton
                        tavoiteId={goal.id}
                        suunnitelmaId={s.id}
                        onDelete={() => removeSuunnitelmaFromStore(goal.id ?? '', s.id ?? '')}
                        name={s.nimi}
                      />
                    </div>
                  </div>
                  {divider}
                </React.Fragment>
              );
            })}
          </div>
        </section>
      </Accordion>
    </div>
  );
};

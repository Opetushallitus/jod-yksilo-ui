import type { components } from '@/api/schema';
import DeleteSuunnitelmaButton from '@/routes/Profile/MyGoals/DeleteSuunnitelmaButton.tsx';
import { getLocalizedText } from '@/utils';
import { Accordion, EmptyState } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export interface PlanListProps {
  goal: components['schemas']['TavoiteDto'];
  language: string;
  removeSuunnitelmaFromStore: (tavoiteId: string, suunnitelmaId: string) => void;
}

export const PlanList = ({ goal, language, removeSuunnitelmaFromStore }: PlanListProps) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { t } = useTranslation();
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = globalThis.matchMedia('(max-width: 767px)').matches;
      setIsOpen(!isMobile);
    };
    handleResize();
    globalThis.addEventListener('resize', handleResize);
    return () => globalThis.removeEventListener('resize', handleResize);
  }, []);

  const accordionId = `suunnitelmat-${goal.id}`;
  const title = t('profile.my-goals.my-plan-towards-goal');
  const emptyPlans = (
    <div className="w-auto">
      <EmptyState text={t('profile.my-goals.empty-plans')} />
    </div>
  );
  const divider = <div className="border-b border-border-gray" />;
  const planPrefixes = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];
  const planPrefix = (index: number): React.JSX.Element => {
    if (planPrefixes.length == 0) {
      return <></>;
    }
    const numberPrefix = Math.floor(index / planPrefixes.length);
    const letter = planPrefixes[index % planPrefixes.length];
    return (
      <span className="text-black">
        {numberPrefix > 0 ? numberPrefix : ''}
        {letter}:
      </span>
    );
  };
  return (
    <div className="mt-8">
      <Accordion
        ariaLabel={title}
        isOpen={isOpen}
        title={
          <h3 className="text-heading-3" aria-controls={accordionId}>
            {title}
          </h3>
        }
      >
        <section aria-labelledby={accordionId} id={accordionId}>
          <div className="flex flex-col gap-3 mt-2">
            {goal.suunnitelmat?.length === 0 && emptyPlans}
            {goal.suunnitelmat?.map((s, index) => (
              <>
                <div key={s.id} className="flex items-center justify-between gap-4">
                  {s.koulutusmahdollisuusId == null && (
                    <div>
                      <p className="text-heading-4 text-accent">
                        {planPrefix(index)} {getLocalizedText(s.nimi)}
                      </p>
                      <p className="text-body-sm mt-2 ds:text-primary-gray">{getLocalizedText(s.kuvaus)}</p>
                    </div>
                  )}
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

                  <DeleteSuunnitelmaButton
                    tavoiteId={goal.id}
                    suunnitelmaId={s.id}
                    onDelete={() => removeSuunnitelmaFromStore(goal.id ?? '', s.id ?? '')}
                    name={s.nimi}
                  />
                </div>
                {divider}
              </>
            ))}
          </div>
        </section>
      </Accordion>
    </div>
  );
};

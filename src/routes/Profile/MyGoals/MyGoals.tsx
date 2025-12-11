import { MainLayout } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, EmptyState, tidyClasses, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { ToolCard } from '../components/ToolCard';
import GoalModal from './addGoal/GoalModal';
import MyGoalsSection from './MyGoalsSection';

const GuidanceCard = ({ testId, className = '' }: { testId: string; className?: string }) => {
  const { t } = useTranslation();

  return (
    <div
      className={tidyClasses(`flex flex-col bg-secondary-1-dark-2 rounded-lg p-6 gap-3 text-white ${className}`)}
      data-testid={testId}
    >
      <h2 className="text-heading-2">{t('home.need-personal-guidance')}</h2>
      <div className="flex flex-col gap-6">
        <p className="text-body-lg">{t('home.need-personal-guidance-content')}</p>
        <Button
          label={t('move-to-service')}
          iconSide="right"
          icon={<JodOpenInNew ariaLabel={t('external-link')} />}
          variant="white"
          linkComponent={getLinkTo(t('navigation.extra.palveluhakemisto.url'), {
            useAnchor: true,
            target: '_blank',
          })}
          className="w-fit"
          testId="goals-service-directory-button"
        />
      </div>
    </div>
  );
};

const MyGoals = () => {
  const { t } = useTranslation();
  const { lg } = useMediaQueries();
  const title = t('profile.my-goals.title');
  const { showModal } = useModal();

  const tavoitteet = useTavoitteetStore((state) => state.tavoitteet);
  const suosikitIsEmpty = useSuosikitStore((state) => {
    const choosableSuosikit = state.suosikit.filter(
      (s) => !tavoitteet.map((t) => t.mahdollisuusId).includes(s.kohdeId) && s.tyyppi === 'TYOMAHDOLLISUUS',
    );
    return choosableSuosikit.length === 0;
  });

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <ProfileNavigationList />
          <ToolCard
            testId="goals-go-to-tool"
            title={t('profile.my-goals.favorites-card.title')}
            description={t('profile.my-goals.favorites-card.description')}
          />
          <GuidanceCard testId="goals-service-directory" />
        </div>
      }
    >
      {!lg && (
        <div className="mb-6">
          <ProfileNavigationList collapsed />
        </div>
      )}

      <title className="text-accent">{title}</title>
      <ProfileSectionTitle type="TAVOITTEENI" title={title} />
      <div className="flex flex-col gap-4 mb-9 sm:text-body-lg text-body-lg-mobile">
        <p>{t('profile.my-goals.description')}</p>
      </div>
      <div className="flex flex-col gap-5">
        <MyGoalsSection tavoitteet={tavoitteet} />
      </div>
      {suosikitIsEmpty && (
        <div className="flex flex-col gap-3 my-3">
          <div className="mt-6 mb-7">
            <EmptyState text={t('profile.my-goals.no-favorites-selected')} testId="goals-empty-state" />
          </div>
        </div>
      )}
      <Button
        variant="accent"
        onClick={() => {
          showModal(GoalModal, { mode: 'ADD' });
        }}
        label={t('profile.my-goals.add-favorites-to-goals')}
        disabled={suosikitIsEmpty}
        testId="goals-add-favorites-button"
      />
      {lg ? null : (
        <div className="flex flex-col gap-4 mt-6">
          <ToolCard
            testId="goals-go-to-tool"
            title={t('profile.my-goals.favorites-card.title')}
            description={t('profile.my-goals.favorites-card.description')}
          />
          <GuidanceCard testId="goals-service-directory" />
        </div>
      )}
    </MainLayout>
  );
};

export default MyGoals;

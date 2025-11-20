import { MainLayout } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { Button, EmptyState, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { ToolCard } from '../components/ToolCard';
import GoalModal from './addGoal/GoalModal.tsx';
import MyGoalsSection from './MyGoalsSection';

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
          <ToolCard testId="goals-go-to-tool" />
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
      {lg ? null : <ToolCard testId="goals-go-to-tool" className="mt-6" />}
    </MainLayout>
  );
};

export default MyGoals;

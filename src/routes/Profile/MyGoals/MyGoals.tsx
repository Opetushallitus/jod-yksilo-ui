import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Button, EmptyState, MainLayout, tidyClasses, useMediaQueries } from '@jod/design-system';
import { JodArrowRight, JodOpenInNew } from '@jod/design-system/icons';

import { Breadcrumb } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { getLinkTo } from '@/utils/routeUtils';

import { ProfileNavigationList, ProfileSectionTitle } from '../components';
import { ToolCard } from '../components/ToolCard';
import GoalModal from './addGoal/GoalModal';
import MyGoalsSection from './MyGoalsSection';

const GuidanceCard = ({ testId, className = '' }: { testId: string; className?: string }) => {
  const { t } = useTranslation();

  return (
    <div
      className={tidyClasses(`flex flex-col gap-3 rounded-lg bg-primary-1-dark-2 p-6 text-white ${className}`)}
      data-testid={testId}
    >
      <h2 className="text-heading-2">{t('home.need-personal-guidance')}</h2>
      <div className="flex flex-col gap-6">
        <p className="text-body-lg">{t('home.need-personal-guidance-content')}</p>
        <Button
          label={t('move-to-service')}
          iconSide="right"
          icon={<JodOpenInNew ariaLabel={t('common:external-link')} />}
          variant="white"
          linkComponent={getLinkTo(t('common:navigation.extra.palveluhakemisto.url'), {
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
  const { t, i18n } = useTranslation();
  const { lg } = useMediaQueries();
  const title = t('profile.my-goals.title');
  const { showModal, showDialog } = useModal();
  const [suosikitDialogShown, setSuosikitDialogShown] = React.useState(false);
  const navigate = useNavigate();

  const tavoitteet = useTavoitteetStore((state) => state.tavoitteet);
  const suosikitIsEmpty = useSuosikitStore((state) => {
    const choosableSuosikit = state.suosikit.filter(
      (s) => !tavoitteet.map((t) => t.mahdollisuusId).includes(s.kohdeId) && s.tyyppi === 'TYOMAHDOLLISUUS',
    );
    return choosableSuosikit.length === 0;
  });

  const guardedAction = useSessionGuardedAction();

  React.useEffect(() => {
    if (suosikitIsEmpty && !suosikitDialogShown && tavoitteet.length === 0) {
      showDialog({
        title: t('profile.my-goals.add-favorites-dialog-title'),
        description: t('profile.my-goals.add-favorites-dialog-description'),
        confirmText: t('profile.my-goals.add-favorites-dialog-action'),
        variant: 'normal',
        confirmButtonIcon: <JodArrowRight />,
        onConfirm: () => {
          void navigate(`/${i18n.language}/${t('slugs.profile.index')}/${t('slugs.profile.favorites')}`);
          setSuosikitDialogShown(true);
        },
        onCancel: () => {
          setSuosikitDialogShown(true);
        },
      });
    }
  }, [i18n.language, navigate, showDialog, suosikitDialogShown, suosikitIsEmpty, t, tavoitteet.length]);

  return (
    <MainLayout
      breadcrumbComponent={<Breadcrumb />}
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
        <div className="mb-6 px-5 sm:px-6">
          <ProfileNavigationList collapsed />
        </div>
      )}

      <title>{title}</title>
      <div className="px-5 sm:px-6 lg:pr-0 lg:pl-6">
        <ProfileSectionTitle type="TAVOITTEENI" title={title} />
        <div className="mb-7 text-body-lg-mobile sm:text-body-lg">
          <p>{t('profile.my-goals.description')}</p>
        </div>
      </div>
      {tavoitteet.length > 0 && <MyGoalsSection tavoitteet={tavoitteet} />}
      {!suosikitIsEmpty && tavoitteet.length === 0 && (
        <div className="mb-6 px-5 sm:pl-6">
          <EmptyState text={t('profile.my-goals.no-goals-created')} testId="goals-empty-state" />
        </div>
      )}
      {suosikitIsEmpty && (
        <div className="mb-[180px] px-5 sm:pl-6">
          <EmptyState text={t('profile.my-goals.no-favorites-selected')} testId="goals-empty-state" />
        </div>
      )}
      <Button
        variant="accent"
        ariaHaspopup="dialog"
        onClick={guardedAction(showModal, GoalModal, { mode: 'ADD' })}
        label={t('profile.my-goals.add-favorites-to-goals')}
        disabled={suosikitIsEmpty}
        testId="goals-add-favorites-button"
        className="mt-7 ml-5 sm:mt-9 sm:ml-6"
      />
      {lg ? null : (
        <div className="mt-6 flex flex-col gap-4 px-5 sm:px-6">
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

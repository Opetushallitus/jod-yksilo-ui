import { MainLayout } from '@/components';
import { usePaamaaratStore } from '@/stores/usePaamaratStore';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { Button } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowForward } from 'react-icons/md';
import { Link } from 'react-router';
import { ProfileNavigationList } from '../components';
import AddGoalModal from './AddGoalModal';
import MyGoalsSection from './MyGoalsSection';

const AwardIcon = ({ color }: { color: 'gold' | 'silver' }) => {
  const fill = color === 'gold' ? '#FF8400' : '#8C8C8C';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.632 2.12468C13.9365 0.809352 16.063 0.809352 17.3676 2.12468C17.8419 2.60283 18.5179 2.82247 19.1825 2.71438C21.0111 2.41706 22.7315 3.66701 23.0138 5.49793C23.1164 6.16351 23.5342 6.73855 24.1355 7.0418C25.7895 7.87605 26.4467 9.89849 25.5989 11.5457C25.2907 12.1444 25.2907 12.8552 25.5989 13.454C26.4467 15.1012 25.7895 17.1236 24.1355 17.9579C23.5342 18.2611 23.1164 18.8362 23.0138 19.5017C22.7315 21.3327 21.0111 22.5826 19.1825 22.2853C18.5179 22.1772 17.8419 22.3969 17.3676 22.875C16.063 24.1903 13.9365 24.1903 12.632 22.875C12.1577 22.3969 11.4817 22.1772 10.817 22.2853C8.98849 22.5826 7.26811 21.3327 6.9858 19.5017C6.88324 18.8362 6.46542 18.2611 5.86414 17.9579C4.21005 17.1236 3.55292 15.1012 4.40074 13.454C4.70894 12.8552 4.70894 12.1444 4.40074 11.5457C3.55292 9.89849 4.21005 7.87605 5.86414 7.0418C6.46542 6.73855 6.88324 6.16351 6.9858 5.49793C7.26811 3.66701 8.98849 2.41706 10.817 2.71438C11.4817 2.82247 12.1577 2.60283 12.632 2.12468ZM14.9998 19.3748C18.7967 19.3748 21.8748 16.2967 21.8748 12.4998C21.8748 8.70287 18.7967 5.6248 14.9998 5.6248C11.2029 5.6248 8.1248 8.70287 8.1248 12.4998C8.1248 16.2967 11.2029 19.3748 14.9998 19.3748Z"
        fill={fill}
      />
      <path
        d="M15 9.6875C13.4467 9.6875 12.1875 10.9467 12.1875 12.5V13.4375H10.3125V12.5C10.3125 9.91119 12.4112 7.8125 15 7.8125H15.9375V9.6875H15Z"
        fill={fill}
      />
      <path
        d="M18.5312 24.3567L21.1444 29.2563L24.088 25.577L28.6162 24.8223L24.8618 19.8164C24.4072 22.661 21.728 24.5989 18.8811 24.136C18.8141 24.1252 18.7461 24.1472 18.6983 24.1954C18.6436 24.2507 18.5878 24.3044 18.5312 24.3567Z"
        fill={fill}
      />
      <path
        d="M5.13713 19.8164L1.38281 24.8222L5.911 25.5769L8.85452 29.2563L11.4677 24.3566C11.4111 24.3043 11.3554 24.2505 11.3006 24.1952C11.2528 24.1471 11.1848 24.125 11.1178 24.1358C8.27089 24.5988 5.59178 22.6608 5.13713 19.8164Z"
        fill={fill}
      />
    </svg>
  );
};

const MyGoals = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const title = t('profile.my-goals.title');
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const suosikitIsEmpty = useSuosikitStore((state) => state.suosikit).length === 0;
  const paamaarat = usePaamaaratStore((state) => state.paamaarat);

  const { pitkanAikavalinTavoite, lyhyenAikavalinTavoite, muutTavoitteet } = React.useMemo(() => {
    return {
      pitkanAikavalinTavoite: paamaarat.filter((p) => p.tyyppi === 'PITKA'),
      lyhyenAikavalinTavoite: paamaarat.filter((p) => p.tyyppi === 'LYHYT'),
      muutTavoitteet: paamaarat.filter((p) => p.tyyppi === 'MUU'),
    };
  }, [paamaarat]);

  const onCloseAddModal = () => {
    setAddModalOpen(false);
  };

  return (
    <MainLayout navChildren={<ProfileNavigationList />}>
      {addModalOpen && <AddGoalModal onClose={onCloseAddModal} isOpen={addModalOpen} />}
      <title>{title}</title>
      <h1 className="mb-5 text-heading-1-mobile sm:text-heading-1">{title}</h1>
      <div className="flex flex-col gap-4 mb-9 sm:text-body-lg text-body-lg-mobile">
        <p>{t('profile.my-goals.description')}</p>
        <p>{t('profile.my-goals.description-2')}</p>
      </div>
      <div className="flex flex-col gap-5">
        <MyGoalsSection
          title={t('profile.my-goals.long-term-goal')}
          description={t('profile.my-goals.long-term-goal-description')}
          icon={<AwardIcon color="gold" />}
          paamaarat={pitkanAikavalinTavoite}
        />
        <MyGoalsSection
          title={t('profile.my-goals.short-term-goal')}
          description={t('profile.my-goals.short-term-goal-description')}
          icon={<AwardIcon color="silver" />}
          paamaarat={lyhyenAikavalinTavoite}
        />
        <MyGoalsSection
          title={t('profile.my-goals.other-goals')}
          description={t('profile.my-goals.other-goals-description')}
          paamaarat={muutTavoitteet}
        />
      </div>
      {suosikitIsEmpty && (
        <div className="flex flex-col gap-3 my-3">
          <p className="text-body-lg">{t('profile.my-goals.no-favorites-selected')}</p>
          <Link
            to={`/${language}/${t('slugs.tool.index')}/${t('slugs.tool.goals')}`}
            type="button"
            className="text-button-md hover:underline text-accent"
          >
            <div className="flex flex-row justify-start">
              <div className="flex items-center gap-2">
                {t('profile.my-goals.add-favorites-link')}
                <MdArrowForward size={24} />
              </div>
            </div>
          </Link>
        </div>
      )}
      <Button
        variant="accent"
        onClick={() => setAddModalOpen(true)}
        label={t('profile.my-goals.add-favorites-to-goals')}
        disabled={suosikitIsEmpty}
      />
    </MainLayout>
  );
};

export default MyGoals;

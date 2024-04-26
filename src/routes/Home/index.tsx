import { useTranslation } from 'react-i18next';
import { Title } from '@/components';
import { HeroCard } from '@jod/design-system';

const Home = () => {
  const { t, i18n } = useTranslation();

  const profileIndexLink = `/${i18n.language}/${t('slugs.profile.index')}`;

  return (
    <main className="mx-auto w-full max-w-screen-lg">
      <Title value={t('home.title')} />
      <div className="mx-auto bg-[url('https://images.unsplash.com/photo-1523464862212-d6631d073194?q=80&w=2070')] bg-[top_-6rem_left_-5rem] py-11">
        <div className="mx-auto flex max-w-[1140px] flex-col gap-11 px-6">
          <div className="mb-[40px] max-w-2xl">
            <HeroCard
              actionContent={t('home.card-1-action-content')}
              backgroundColor="#006DB3F2"
              content={t('home.card-1-content')}
              title={t('home.card-1-title')}
              href={profileIndexLink}
            />
          </div>
          <div className="grid grid-flow-row auto-rows-max grid-cols-1 gap-[32px] sm:grid-cols-3">
            <HeroCard backgroundColor="#00A8B3F2" title={t('home.card-2-title')} href={profileIndexLink} />
            <HeroCard backgroundColor="#EE7C45F2" title={t('home.card-3-title')} href={profileIndexLink} />
            <HeroCard backgroundColor="#CD4EB3F2" title={t('home.card-4-title')} href={profileIndexLink} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;

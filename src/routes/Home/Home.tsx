import { Title } from '@/components';
import { HeroCard } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Home = () => {
  const { t, i18n } = useTranslation();

  return (
    <main role="main" className="mx-auto w-full max-w-screen-lg" id="jod-main">
      <Title value={t('home.title')} />
      <div className="mx-auto bg-[url(@/../assets/hero.jpeg)] bg-[top_-6rem_left_-5rem] py-11">
        <div className="mx-auto flex max-w-[1140px] flex-col gap-11 px-6 hyphens-auto lg:hyphens-none">
          <div className="mb-[40px] max-w-2xl">
            <HeroCard backgroundColor="#006DB3F2" content={t('home.card-1-content')} title={t('home.card-1-title')} />
          </div>
          <div className="grid grid-flow-row auto-rows-max grid-cols-1 gap-[32px] md:grid-cols-3">
            <HeroCard
              to={`/${i18n.language}/${t('slugs.tool.index')}/${t('slugs.tool.competences')}`}
              linkComponent={Link}
              size="sm"
              textColor="#000"
              backgroundColor="#00A8B3F2"
              title={t('home.card-2-title')}
            />
            <HeroCard size="sm" textColor="#000" backgroundColor="#EE7C45F2" title={t('home.card-3-title')} />
            <HeroCard size="sm" textColor="#000" backgroundColor="#CD4EB3F2" title={t('home.card-4-title')} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;

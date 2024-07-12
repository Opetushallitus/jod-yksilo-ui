import { Title } from '@/components';
import { HeroCard } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t, i18n } = useTranslation();

  const toolIndexLink = `/${i18n.language}/${t('slugs.tool.index')}`;

  return (
    <main role="main" className="mx-auto w-full max-w-screen-lg" id="jod-main">
      <Title value={t('home.title')} />
      <div className="mx-auto bg-[url(@/../assets/hero.jpeg)] bg-[top_-6rem_left_-5rem] py-11">
        <div className="mx-auto flex max-w-[1140px] flex-col gap-11 px-6">
          <div className="mb-[40px] max-w-2xl">
            <HeroCard
              actionContent={t('home.card-1-action-content')}
              backgroundColor="#006DB3F2"
              content={t('home.card-1-content')}
              title={t('home.card-1-title')}
              href={toolIndexLink}
            />
          </div>
          <div className="grid grid-flow-row auto-rows-max grid-cols-1 gap-[32px] sm:grid-cols-3">
            <HeroCard backgroundColor="#00A8B3F2" title={t('home.card-2-title')} href={toolIndexLink} />
            <HeroCard backgroundColor="#EE7C45F2" title={t('home.card-3-title')} href={toolIndexLink} />
            <HeroCard backgroundColor="#CD4EB3F2" title={t('home.card-4-title')} href={toolIndexLink} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;

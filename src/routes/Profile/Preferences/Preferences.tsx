import { MainLayout } from '@/components';
import { useTranslation } from 'react-i18next';
import { ProfileNavigationList } from '../components';

const Preferences = () => {
  const { t } = useTranslation();
  const title = t('profile.preferences.title');

  return (
    <MainLayout navChildren={<ProfileNavigationList />}>
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{t('profile.preferences.title')}</h1>

      <div className="mb-8 text-body-md flex flex-col gap-7">
        <p className="bg-todo">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut aliquet at tortor sed rutrum. Maecenas facilisis
          pretium velit, in consectetur ipsum scelerisque quis. Curabitur eu diam a massa pretium commodo. Pellentesque
          habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse eleifend lorem
          nunc, eu vehicula orci malesuada vitae. Nam ac arcu finibus, feugiat ipsum et, bibendum augue. Curabitur orci
          risus, tempus in mollis aliquam, tempor eu nisl. Etiam tellus nibh, auctor lobortis consectetur in, commodo
          vel quam. Suspendisse ac libero porttitor, eleifend elit a, interdum sem. In congue nunc non rhoncus
          imperdiet. Etiam magna neque, mollis et congue nec, ullamcorper ut tellus. Donec ac luctus quam. Etiam mattis
          magna eu augue efficitur tristique.
        </p>
      </div>
    </MainLayout>
  );
};

export default Preferences;

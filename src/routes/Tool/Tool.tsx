import { Title } from '@/components';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import MatchedLink from './MatchedLink';

const Tool = () => {
  const { t, i18n } = useTranslation();

  const toolIndexSlug = t('slugs.tool.index');
  const linksOnLeft = [
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.instructions')}`,
      text: t('instructions'),
      icon: 'menu_book',
    },
    { to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.goals')}`, text: t('goals'), icon: 'target' },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.competences')}`,
      text: t('competences'),
      icon: 'school',
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.interests')}`,
      text: t('interests'),
      icon: 'interests',
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.restrictions')}`,
      text: t('restrictions'),
      icon: 'block',
    },
  ];
  const linkOnRight = [
    { to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.search')}`, text: t('search'), icon: 'search' },
  ];

  return (
    <main role="main" className="mx-auto max-w-[1140px] p-6" id="jod-main">
      <Title value={t('tool.title')} />
      <nav role="navigation">
        <div className="flex justify-between">
          <ul className="m-0 space-x-[25px] p-0">
            {linksOnLeft.map((link) => (
              <li className="inline-block" key={link.text}>
                <MatchedLink link={link} />
              </li>
            ))}
          </ul>
          <ul className="m-0 space-x-[25px] p-0">
            {linkOnRight.map((link) => (
              <li className="inline-block" key={link.text}>
                <MatchedLink link={link} />
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <Outlet />
    </main>
  );
};

export default Tool;

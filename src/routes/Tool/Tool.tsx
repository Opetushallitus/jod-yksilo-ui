import { Title } from '@/components';
import { useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import MatchedLink from './MatchedLink';

const Tool = () => {
  const { sm } = useMediaQueries();
  const { t, i18n } = useTranslation();

  const toolIndexSlug = t('slugs.tool.index');
  const linksOnLeft = [
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
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.instructions')}`,
      text: t('instructions'),
      icon: 'menu_book',
    },
  ];

  const Desktop = () => {
    return (
      <div className="flex justify-between">
        <ul className="m-0 space-x-[16px] p-0">
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
    );
  };

  const Mobile = () => {
    return (
      <div className="flex">
        <ul className="m-0 space-x-[8px] p-0 flex flex-1 justify-between">
          {linksOnLeft.map((link) => (
            <li className="inline-block" key={link.text}>
              <MatchedLink link={link} />
            </li>
          ))}
          {linkOnRight.map((link) => (
            <li className="inline-block" key={link.text}>
              <MatchedLink link={link} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <main role="main" className="mx-auto max-w-[1140px] p-5" id="jod-main">
      <Title value={t('tool.title')} />
      <nav role="navigation">{sm ? <Desktop /> : <Mobile />}</nav>
      <Outlet />
    </main>
  );
};

export default Tool;

/* eslint-disable sonarjs/no-duplicate-string */
import { Route, Routes, Link, useMatch, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Title } from '@/components';
import { RoundLinkButton } from '@jod/design-system';
import Instructions from './instructions';
import NoMatch from '../NoMatch';
import Goals from './goals';
import Competences from './competences';
import Interests from './interests';
import Restrictions from './restrictions';
import Search from './search';

const MatchedLink = ({ link }: { link: { to: string; text: string; icon: string } }) => {
  const match = useMatch(link.to);
  const selected = match?.pathname == link.to;
  return (
    <RoundLinkButton
      label={link.text}
      icon={link.icon}
      selected={selected}
      component={({ ...rootProps }) => <Link to={link.to} {...rootProps}></Link>}
    ></RoundLinkButton>
  );
};

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
    <main className="mx-auto max-w-[1140px] p-6" id="jod-main">
      <Title value={t('tool.title')} />
      <nav>
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
      <Routes>
        <Route index element={<Navigate to={`${t('slugs.tool.instructions')}`} />} />
        <Route path={`${t('slugs.tool.instructions')}/*`} element={<Instructions />} />
        <Route path={`${t('slugs.tool.goals')}/*`} element={<Goals />} />
        <Route path={`${t('slugs.tool.competences')}/*`} element={<Competences />} />
        <Route path={`${t('slugs.tool.interests')}/*`} element={<Interests />} />
        <Route path={`${t('slugs.tool.restrictions')}/*`} element={<Restrictions />} />
        <Route path={`${t('slugs.tool.search')}/*`} element={<Search />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </main>
  );
};

export default Tool;

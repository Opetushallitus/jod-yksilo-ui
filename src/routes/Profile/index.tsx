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

const MatchedLink = ({ link }: { link: { to: string; text: string } }) => {
  const match = useMatch(link.to);
  const selected = match?.pathname == link.to;
  return (
    <RoundLinkButton
      label={link.text}
      selected={selected}
      component={({ children, ...rootProps }) => (
        <Link to={link.to} {...rootProps}>
          {children}
        </Link>
      )}
    ></RoundLinkButton>
  );
};

const Profile = () => {
  const { t, i18n } = useTranslation();

  const profileIndexSlug = t('slugs.profile.index');
  const linksOnLeft = [
    { to: `/${i18n.language}/${profileIndexSlug}/${t('slugs.profile.instructions')}`, text: t('instructions') },
    { to: `/${i18n.language}/${profileIndexSlug}/${t('slugs.profile.goals')}`, text: t('goals') },
    { to: `/${i18n.language}/${profileIndexSlug}/${t('slugs.profile.competences')}`, text: t('competences') },
    { to: `/${i18n.language}/${profileIndexSlug}/${t('slugs.profile.interests')}`, text: t('interests') },
    { to: `/${i18n.language}/${profileIndexSlug}/${t('slugs.profile.restrictions')}`, text: t('restrictions') },
  ];
  const linkOnRight = [{ to: `/${i18n.language}/${profileIndexSlug}/${t('slugs.profile.search')}`, text: t('search') }];

  return (
    <>
      <Title value={t('profile')} />
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
        <Route index element={<Navigate to={`${t('slugs.profile.instructions')}`} />} />
        <Route path={`${t('slugs.profile.instructions')}/*`} element={<Instructions />} />
        <Route path={`${t('slugs.profile.goals')}/*`} element={<Goals />} />
        <Route path={`${t('slugs.profile.competences')}/*`} element={<Competences />} />
        <Route path={`${t('slugs.profile.interests')}/*`} element={<Interests />} />
        <Route path={`${t('slugs.profile.restrictions')}/*`} element={<Restrictions />} />
        <Route path={`${t('slugs.profile.search')}/*`} element={<Search />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </>
  );
};

export default Profile;

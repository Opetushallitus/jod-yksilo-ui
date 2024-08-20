import { Title } from '@/components';
import { useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { MdBlock, MdOutlineInterests, MdOutlineSchool } from 'react-icons/md';
import { Outlet } from 'react-router-dom';
import MatchedLink from './MatchedLink';

const TargetIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size}>
    <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-60q142.38 0 241.19-98.81Q820-337.63 820-480q0-142.38-98.81-241.19T480-820q-142.37 0-241.19 98.81Q140-622.38 140-480q0 142.37 98.81 241.19Q337.63-140 480-140Zm0-100q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170t-170 70Zm0-60q75 0 127.5-52.5T660-480q0-75-52.5-127.5T480-660q-75 0-127.5 52.5T300-480q0 75 52.5 127.5T480-300Zm0-100q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Z" />
  </svg>
);

const MenuBookIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size}>
    <path d="M560-574v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-610q-38 0-73 9.5T560-574Zm0 220v-49q33-13.5 67.5-20.25T700-430q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-390q-38 0-73 9t-67 27Zm0-110v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-500q-38 0-73 9.5T560-464ZM248-300q53.57 0 104.28 12.5Q403-275 452-250v-427q-45-30-97.62-46.5Q301.76-740 248-740q-38 0-74.5 9.5T100-707v434q31-14 70.5-20.5T248-300Zm264 50q50-25 98-37.5T712-300q38 0 78.5 6t69.5 16v-429q-34-17-71.82-25-37.82-8-76.18-8-54 0-104.5 16.5T512-677v427Zm-30 90q-51-38-111-58.5T248-239q-36.54 0-71.77 9T106-208q-23.1 11-44.55-3Q40-225 40-251v-463q0-15 7-27.5T68-761q42-20 87.39-29.5 45.4-9.5 92.61-9.5 63 0 122.5 17T482-731q51-35 109.5-52T712-800q46.87 0 91.93 9.5Q849-781 891-761q14 7 21.5 19.5T920-714v463q0 27.89-22.5 42.45Q875-194 853-208q-34-14-69.23-22.5Q748.54-239 712-239q-63 0-121 21t-109 58ZM276-489Z" />
  </svg>
);

const Tool = () => {
  const { sm } = useMediaQueries();
  const { t, i18n } = useTranslation();

  const toolIndexSlug = t('slugs.tool.index');
  const linksOnLeft = [
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.goals')}`,
      text: t('goals'),
      icon: <TargetIcon size={48} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.competences')}`,
      text: t('competences'),
      icon: <MdOutlineSchool size={48} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.interests')}`,
      text: t('interests'),
      icon: <MdOutlineInterests size={48} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.restrictions')}`,
      text: t('restrictions'),
      icon: <MdBlock size={48} />,
    },
  ];
  const linkOnRight = [
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.instructions')}`,
      text: t('instructions'),
      icon: <MenuBookIcon size={48} />,
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

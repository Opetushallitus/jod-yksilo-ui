import { getTextClassByCompetenceSourceType, type ProfileSectionType } from '@/routes/Profile/utils';
import { cx, tidyClasses } from '@jod/design-system';
import {
  JodCheckmarkAlt,
  JodFavorite,
  JodFavs,
  JodInterests,
  JodOther,
  JodSkills,
  JodWork,
} from '@jod/design-system/icons';
import React from 'react';

export const ProfileSectionTitle = ({ type, title }: { type: ProfileSectionType; title: string }) => {
  const iconMap: Record<ProfileSectionType, React.ReactNode> = {
    TOIMENKUVA: <JodWork />,
    KOULUTUS: <JodSkills />,
    PATEVYYS: <JodInterests />,
    MUU_OSAAMINEN: <JodOther />,
    KIINNOSTUS: <JodFavs />,
    SUOSIKKI: <JodFavorite />,
    OSAAMISENI: <JodCheckmarkAlt />,
    PAAMAARA: null,
    ASETUKSENI: null,
  };

  const iconBg = cx({
    'bg-secondary-4-dark': type === 'TOIMENKUVA',
    'bg-secondary-2-dark': type === 'KOULUTUS',
    'bg-secondary-1': type === 'PATEVYYS',
    'bg-secondary-gray': type === 'MUU_OSAAMINEN',
    'bg-secondary-3': type === 'KIINNOSTUS',
    'bg-secondary-1-dark-2': ['SUOSIKKI', 'OSAAMISENI', 'PAAMAARA', 'ASETUKSENI'].includes(type),
  });

  const showIcon = type && iconMap[type] !== null;

  return (
    <div className="mb-5 text-heading-2 sm:text-heading-1 flex items-center gap-4">
      {showIcon && (
        <span className={`${iconBg} text-white rounded-full sm:size-9 size-8 justify-center items-center flex`}>
          {iconMap[type]}
        </span>
      )}
      <h1
        className={tidyClasses([
          'text-heading-1-mobile',
          'sm:text-heading-1',
          getTextClassByCompetenceSourceType(type),
        ])}
      >
        {title}
      </h1>
    </div>
  );
};

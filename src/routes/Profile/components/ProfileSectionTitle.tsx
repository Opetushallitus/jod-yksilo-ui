import { IconHeading } from '@/components/IconHeading';
import { getTextClassByCompetenceSourceType, type ProfileSectionType } from '@/routes/Profile/utils';
import { cx } from '@jod/design-system';
import {
  JodCheckmarkAlt,
  JodFavorite,
  JodFavs,
  JodFlag,
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
    TAVOITTEENI: <JodFlag />,
    ASETUKSENI: null,
  };

  const iconBg = cx({
    'bg-secondary-4-dark': type === 'TOIMENKUVA',
    'bg-secondary-2-dark': type === 'KOULUTUS',
    'bg-secondary-1-dark': type === 'PATEVYYS',
    'bg-secondary-gray': type === 'MUU_OSAAMINEN',
    'bg-secondary-3': type === 'KIINNOSTUS',
    'bg-secondary-1-dark-2': ['SUOSIKKI', 'OSAAMISENI', 'TAVOITTEENI', 'ASETUKSENI'].includes(type),
  });

  const showIcon = type && iconMap[type] !== null;

  return (
    <IconHeading
      icon={showIcon ? iconMap[type] : undefined}
      title={title}
      bgClassName={iconBg}
      textClassName={getTextClassByCompetenceSourceType(type)}
      testId="profile-section-title"
    />
  );
};

import React from 'react';

import { cx, IconHeading } from '@jod/design-system';
import {
  JodCog,
  JodCheckmarkAlt,
  JodFavorite,
  JodFavs,
  JodFlag,
  JodInterests,
  JodOther,
  JodShare,
  JodSkills,
  JodWork,
} from '@jod/design-system/icons';

import { getTextClassByCompetenceSourceType, type ProfileSectionType } from '@/routes/Profile/utils';

export const ProfileSectionTitle = ({ type, title }: { type: ProfileSectionType; title: string }) => {
  const iconMap: Record<ProfileSectionType, React.ReactNode> = {
    TOIMENKUVA: <JodWork />,
    KOULUTUS: <JodSkills />,
    TOIMINTO: <JodInterests />,
    MUU_OSAAMINEN: <JodOther />,
    KIINNOSTUS: <JodFavs />,
    SUOSIKKI: <JodFavorite />,
    OSAAMISENI: <JodCheckmarkAlt />,
    TAVOITTEENI: <JodFlag />,
    TUO_JA_VIE_TIETOJA: <JodShare />,
    ASETUKSENI: <JodCog />,
  };

  const iconBg = cx({
    'bg-primary-4-dark': type === 'TOIMENKUVA',
    'bg-primary-2-dark': type === 'KOULUTUS',
    'bg-primary-1-dark': type === 'TOIMINTO',
    'bg-secondary-gray': type === 'MUU_OSAAMINEN',
    'bg-primary-3': type === 'KIINNOSTUS',
    'bg-primary-1-dark-2': ['SUOSIKKI', 'OSAAMISENI', 'TAVOITTEENI', 'TUO_JA_VIE_TIETOJA', 'ASETUKSENI'].includes(type),
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

import { IconHeading } from '@jod/design-system';

import {
  getBgClassByProfileSectionType,
  getIconByProfileSectionType,
  getTextClassByCompetenceSourceType,
  type ProfileSectionType,
} from '@/routes/Profile/utils';

export const ProfileSectionTitle = ({ type, title }: { type: ProfileSectionType; title: string }) => {
  const icon = type ? getIconByProfileSectionType(type) : undefined;

  return (
    <IconHeading
      icon={icon ?? undefined}
      title={title}
      bgClassName={getBgClassByProfileSectionType(type)}
      textClassName={getTextClassByCompetenceSourceType(type)}
      testId="profile-section-title"
    />
  );
};

import { ProfileLink } from '@/routes/Profile/utils';
import React from 'react';

export interface HelpingToolLinkItemProps {
  icon: React.ReactNode;
  title: string;
}

export interface HelpingToolProfileLinkItemProps extends HelpingToolLinkItemProps {
  profileLink: ProfileLink;
}

export const HelpingToolProfileLinkItem = ({ profileLink, icon, title }: HelpingToolProfileLinkItemProps) => {
  return (
    <HelpingToolLinkItem
      component={({ ...rootProps }) => (
        <profileLink.component to={profileLink.to} {...rootProps}></profileLink.component>
      )}
      icon={icon}
      title={title}
    />
  );
};

interface ComponentProp {
  component: React.ComponentType<{ children: React.ReactNode }>;
}

export const HelpingToolLinkItem = ({
  component: Component,
  icon,
  title,
}: HelpingToolLinkItemProps & ComponentProp) => {
  return (
    <li className="group">
      <Component>
        <div className="flex gap-x-4">
          {icon}
          <div className="text-heading-4 text-black group-hover:text-accent group-hover:underline">{title}</div>
        </div>
      </Component>
    </li>
  );
};

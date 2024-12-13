import { ProfileLink } from '@/routes/Profile/utils';
import React from 'react';

export interface HelpingToolLinkItemProps {
  icon: React.ReactNode;
  title: string;
}

export interface HelpingToolProfileLinkItemProps extends HelpingToolLinkItemProps {
  profileLink: ProfileLink;
}

export interface HelpingToolExternalLinkItemProps extends HelpingToolLinkItemProps {
  href: string;
}

export const HelpingToolProfileLinkItem = ({ profileLink, icon, title }: HelpingToolProfileLinkItemProps) => {
  return (
    <HelpingToolLinkItem
      /* eslint-disable-next-line react/no-unstable-nested-components */
      component={({ ...rootProps }) => (
        <profileLink.component to={profileLink.to} {...rootProps}></profileLink.component>
      )}
      icon={icon}
      title={title}
    />
  );
};

export const HelpingToolExternalLinkItem = ({ href, icon, title }: HelpingToolExternalLinkItemProps) => {
  return (
    <HelpingToolLinkItem
      /* eslint-disable-next-line react/no-unstable-nested-components */
      component={({ ...rootProps }) => (
        <a href={href} {...rootProps} target="_blank" rel="noreferrer">
          {rootProps.children}
        </a>
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
        <div className="flex gap-x-3">
          {icon}
          <div className="text-heading-4 text-black group-hover:text-link group-hover:underline">{title}</div>
        </div>
      </Component>
    </li>
  );
};

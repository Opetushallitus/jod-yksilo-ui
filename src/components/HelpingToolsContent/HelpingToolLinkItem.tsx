import { ProfileLink } from '@/routes/Profile/utils';
import React from 'react';

export interface HelpingToolLinkItemProps {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  title: string;
}

export interface HelpingToolProfileLinkItemProps extends HelpingToolLinkItemProps {
  profileLink: ProfileLink;
}

export interface HelpingToolExternalLinkItemProps extends HelpingToolLinkItemProps {
  href: string;
}

export const HelpingToolProfileLinkItem = ({
  profileLink,
  iconLeft,
  iconRight,
  title,
}: HelpingToolProfileLinkItemProps) => {
  return (
    <HelpingToolLinkItem
      /* eslint-disable-next-line react/no-unstable-nested-components */
      component={({ ...rootProps }) => (
        <profileLink.component to={profileLink.to} {...rootProps}></profileLink.component>
      )}
      iconLeft={iconLeft}
      iconRight={iconRight}
      title={title}
    />
  );
};

export const HelpingToolExternalLinkItem = ({ href, iconLeft, iconRight, title }: HelpingToolExternalLinkItemProps) => {
  return (
    <HelpingToolLinkItem
      /* eslint-disable-next-line react/no-unstable-nested-components */
      component={({ ...rootProps }) => (
        <a href={href} {...rootProps} target="_blank" rel="noreferrer">
          {rootProps.children}
        </a>
      )}
      iconLeft={iconLeft}
      iconRight={iconRight}
      title={title}
    />
  );
};

interface ComponentProp {
  component: React.ComponentType<{ children: React.ReactNode }>;
}

export const HelpingToolLinkItem = ({
  component: Component,
  iconLeft,
  iconRight,
  title,
}: HelpingToolLinkItemProps & ComponentProp) => {
  return (
    <li className="group">
      <Component>
        <div className="flex gap-x-3">
          {iconLeft ?? null}
          <div className="text-heading-4 text-accent group-hover:text-link group-hover:underline">{title}</div>
          {iconRight ?? null}
        </div>
      </Component>
    </li>
  );
};

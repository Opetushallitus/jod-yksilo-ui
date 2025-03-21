import { LangCode } from '@/i18n/config';
import { Accordion } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SimpleNavigationListProps {
  title: string;
  titleComponent?: React.ReactNode;
  titleLink?: string;
  collapsible?: boolean;
  children: React.ReactNode;
  borderEnabled?: boolean;
  addPadding?: boolean;
  backgroundClassName?: string;
  lang?: LangCode;
}

export const SimpleNavigationList = ({
  title,
  titleComponent,
  collapsible = false,
  children,
  borderEnabled = true,
  addPadding = true,
  backgroundClassName = 'bg-secondary-1-25',
  lang,
}: SimpleNavigationListProps) => {
  const { i18n } = useTranslation();
  const borderClassName = borderEnabled ? 'rounded-md' : '';
  const paddingClassName = addPadding ? 'py-6 px-[20px]' : '';
  const language = lang ?? i18n.language;

  return (
    <div className={`${borderClassName} ${backgroundClassName} ${paddingClassName}`.trim()}>
      {collapsible ? (
        <Accordion title={title} lang={language}>
          {children}
        </Accordion>
      ) : (
        <>
          <div className="hyphens-auto text-heading-3" lang={language}>
            {titleComponent ? titleComponent : title}
          </div>
          {children}
        </>
      )}
    </div>
  );
};

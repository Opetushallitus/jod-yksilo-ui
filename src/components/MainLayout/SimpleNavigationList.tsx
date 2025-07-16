import { LangCode } from '@/i18n/config';
import { Accordion } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface SimpleNavigationListProps {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
  backgroundClassName?: string;
  lang?: LangCode;
}

export const SimpleNavigationList = ({
  title,
  collapsible = false, // For filters
  children,
  backgroundClassName = 'bg-secondary-1-25', // For filters
  lang,
}: SimpleNavigationListProps) => {
  const { i18n } = useTranslation();
  const language = lang ?? i18n.language;
  return (
    <div className={`rounded-md ${backgroundClassName} py-6 px-[20px]`.trim()}>
      {collapsible ? (
        <Accordion title={title} lang={language}>
          {children}
        </Accordion>
      ) : (
        <>
          <div className="hyphens-auto text-heading-3" lang={language}>
            {title}
          </div>
          {children}
        </>
      )}
    </div>
  );
};

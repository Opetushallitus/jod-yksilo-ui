import { useTranslation } from 'react-i18next';
import { Accordion } from '@/components';

interface SimpleNavigationListProps {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
}

export const SimpleNavigationList = ({ title, collapsible = false, children }: SimpleNavigationListProps) => {
  const { i18n } = useTranslation();
  return (
    <div className="rounded-[20px] border-[3px] border-solid border-secondary-gray bg-white px-[20px] py-6">
      {collapsible ? (
        <Accordion title={title}>{children}</Accordion>
      ) : (
        <>
          <div className="hyphens-auto text-heading-4" lang={i18n.language}>
            {title}
          </div>
          {children}
        </>
      )}
    </div>
  );
};

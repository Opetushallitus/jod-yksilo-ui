import { Accordion } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface SimpleNavigationListProps {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
  borderEnabled?: boolean;
  addPadding?: boolean;
}

export const SimpleNavigationList = ({
  title,
  collapsible = false,
  children,
  borderEnabled = true,
  addPadding = true,
}: SimpleNavigationListProps) => {
  const { i18n, t } = useTranslation();
  const borderClassName = borderEnabled ? 'rounded-[20px] border-[3px] border-solid border-secondary-gray' : '';
  const paddingClassName = addPadding ? 'py-6 px-[20px]' : '';
  return (
    <div className={`${borderClassName} bg-white ${paddingClassName}`.trim()}>
      {collapsible ? (
        <Accordion
          title={title}
          expandLessText={t('expand-less')}
          expandMoreText={t('expand-more')}
          lang={i18n.language}
        >
          {children}
        </Accordion>
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

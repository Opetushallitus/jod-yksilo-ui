import { LangCode } from '@/i18n/config';
import { Accordion } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

interface SimpleNavigationListProps {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
  borderEnabled?: boolean;
  addPadding?: boolean;
  backgroundClassName?: string;
  lang?: LangCode;
}

export const SimpleNavigationList = ({
  title,
  collapsible = false,
  children,
  borderEnabled = true,
  addPadding = true,
  backgroundClassName = 'bg-secondary-1-25',
  lang,
}: SimpleNavigationListProps) => {
  const { i18n, t } = useTranslation();
  const borderClassName = borderEnabled ? 'rounded-md' : '';
  const paddingClassName = addPadding ? 'py-6 px-[20px]' : '';
  const language = lang ?? i18n.language;
  return (
    <div className={`${borderClassName} ${backgroundClassName} ${paddingClassName}`.trim()}>
      {collapsible ? (
        <Accordion title={title} expandLessText={t('expand-less')} expandMoreText={t('expand-more')} lang={language}>
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

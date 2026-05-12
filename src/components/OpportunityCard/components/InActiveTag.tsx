import { Trans, useTranslation } from 'react-i18next';

import { JodError } from '@jod/design-system/icons';

import { AnchorLink } from '@/components/AnchorLink/AnchorLink';
import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';

interface InActiveTagProps {
  name?: string;
}

export const InActiveTag = ({ name }: InActiveTagProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <TooltipWrapper
      tooltipPlacement="top"
      triggerClassName="flex items-center gap-3 rounded-2xl px-4 bg-warning self-start"
      tooltipContent={
        <div className="max-w-[290px] text-body-xs leading-5">
          <Trans
            i18nKey="profile.favorites.inActiveTagTooltip"
            components={{
              CustomLink: (
                <AnchorLink
                  href={`/yksilo/${language}/${t('slugs.search')}?q=${name}`}
                  className="inline-flex underline"
                  target="_blank"
                />
              ),
            }}
          />
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <JodError size={16} className="text-primary-gray" />
        <span className="rounded-2xl font-semibold py-2 text-[0.8rem] text-nowrap">
          {t('profile.favorites.inActiveTag')}
        </span>
      </div>
    </TooltipWrapper>
  );
};

import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { langLabels, supportedLanguageCodes } from '@/i18n/config';
import { PopupList, cx } from '@jod/design-system';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export interface LanguageMenuProps {
  inline?: boolean;
  onClick: () => void;
}

const ListItems = ({ onClick }: { onClick: LanguageMenuProps['onClick'] }) => {
  const {
    i18n: { language },
  } = useTranslation();
  const { generateLocalizedPath } = useLocalizedRoutes();

  return supportedLanguageCodes.map((lng) => (
    <Link
      key={lng}
      to={generateLocalizedPath(lng)}
      onClick={onClick}
      type="button"
      className={cx('w-full text-button-md hover:underline px-5 py-3', {
        'bg-secondary-1-50 rounded': lng === language,
      })}
      data-testid={`language-menu-item-${lng}`}
    >
      {langLabels[lng] ?? lng}
    </Link>
  ));
};

export const LanguageMenu = forwardRef<HTMLDivElement, LanguageMenuProps>(function LanguageMenuWithRef(props, ref) {
  return props.inline ? (
    <div data-testid="language-menu-inline">
      <ListItems onClick={props.onClick} />
    </div>
  ) : (
    <div ref={ref} data-testid="language-menu-popup">
      <PopupList classNames="gap-2">
        <ListItems onClick={props.onClick} />
      </PopupList>
    </div>
  );
});

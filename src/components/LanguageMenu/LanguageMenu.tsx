import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes';
import { langLabels, supportedLanguageCodes } from '@/i18n/config';
import { PopupList, cx } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
    >
      {langLabels[lng] ?? lng}
    </Link>
  ));
};

export const LanguageMenu = ({ inline, onClick }: LanguageMenuProps) => {
  return inline ? (
    <ListItems onClick={onClick} />
  ) : (
    <PopupList classNames="!bg-bg-gray-2 gap-y-2">
      <ListItems onClick={onClick} />
    </PopupList>
  );
};

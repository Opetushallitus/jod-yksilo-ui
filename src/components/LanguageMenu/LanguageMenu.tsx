import { LangCode, supportedLanguageCodes } from '@/i18n/config';
import { PopupList } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

export interface LanguageMenuProps {
  inline?: boolean;
  onLanguageClick: (lang: LangCode) => Promise<void>;
}

const ListItems = ({ onLanguageClick }: Pick<LanguageMenuProps, 'onLanguageClick'>) => {
  const { t, i18n } = useTranslation();
  return (
    <>
      {supportedLanguageCodes.map((lng) => (
        <div key={`lang-${lng}-key`} className="hyphens-auto w-full text-button-md text-black hover:underline">
          <button
            type="button"
            className={`text-bold text-black p-3 ${lng === i18n.language ? 'bg-secondary-1-50 rounded w-full text-left' : ''}`}
            onClick={() => void onLanguageClick(lng)}
          >
            {t(`slugs.language.${lng}`)}
          </button>
        </div>
      ))}
    </>
  );
};

export const LanguageMenu = ({ inline, onLanguageClick }: LanguageMenuProps) => {
  return inline ? (
    <ListItems onLanguageClick={onLanguageClick} />
  ) : (
    <PopupList classNames="!bg-bg-gray-2">
      <ListItems onLanguageClick={onLanguageClick} />
    </PopupList>
  );
};

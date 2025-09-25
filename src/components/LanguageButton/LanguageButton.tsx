import { LanguageMenu } from '@/components/LanguageMenu/LanguageMenu';
import { type LangCode, langLabels } from '@/i18n/config';
import { useMediaQueries } from '@jod/design-system';
import { JodCaretDown, JodCaretUp, JodLanguage } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';

interface LanguageButtonProps {
  onClick: () => void;
  langMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onMenuBlur: (event: React.FocusEvent<HTMLDivElement>) => void;
  onMenuClick: () => void;
}

export const LanguageButton = ({ onClick, langMenuOpen, menuRef, onMenuBlur, onMenuClick }: LanguageButtonProps) => {
  const {
    i18n: { language: languageKey },
  } = useTranslation();

  const { sm } = useMediaQueries();

  const carets = sm ? <>{langMenuOpen ? <JodCaretUp size={20} /> : <JodCaretDown size={20} />}</> : null;

  return (
    <div className="relative" data-testid="language-button">
      <button
        onClick={onClick}
        className="flex flex-col sm:flex-row justify-center items-center select-none cursor-pointer sm:mr-5"
        data-testid="language-button-trigger"
      >
        <JodLanguage className="mx-auto" />
        <span className="whitespace-nowrap text-[12px] sm:text-button-sm sm:mx-3">
          {langLabels[languageKey as LangCode]}
        </span>
        {carets}
      </button>
      {langMenuOpen && (
        <div
          ref={menuRef}
          onBlur={onMenuBlur}
          className="z-60 absolute right-0 translate-y-8"
          data-testid="language-menu"
        >
          <LanguageMenu onClick={onMenuClick} />
        </div>
      )}
    </div>
  );
};

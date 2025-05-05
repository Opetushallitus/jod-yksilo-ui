import { LanguageMenu } from '@/components/LanguageMenu/LanguageMenu';
import { langLabels } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { MdExpandMore, MdLanguage } from 'react-icons/md';

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

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="ds:flex ds:gap-2 ds:justify-center ds:items-center ds:select-none ds:cursor-pointer"
      >
        <span className="ds:size-7 ds:flex ds:justify-center ds:items-center">
          <MdLanguage size={24} />
        </span>
        <span className="ds:py-3 ds:whitespace-nowrap">{langLabels[languageKey as keyof typeof langLabels]}</span>
        <span className="ds:size-7 ds:flex ds:justify-center ds:items-center">
          <MdExpandMore size={24} />
        </span>
      </button>
      {langMenuOpen && (
        <div ref={menuRef} onBlur={onMenuBlur} className="absolute right-0 translate-y-8">
          <LanguageMenu onClick={onMenuClick} />
        </div>
      )}
    </div>
  );
};

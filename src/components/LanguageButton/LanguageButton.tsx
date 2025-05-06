import { LanguageMenu } from '@/components/LanguageMenu/LanguageMenu';
import { langLabels } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { MdExpandLess, MdExpandMore, MdLanguage } from 'react-icons/md';

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
      <button onClick={onClick} className="flex gap-2 justify-center items-center select-none cursor-pointer">
        <span className="size-7 flex justify-center items-center">
          <MdLanguage size={24} />
        </span>
        <span className="py-3 whitespace-nowrap">{langLabels[languageKey as keyof typeof langLabels]}</span>
        <span className="size-7 flex justify-center items-center">
          {langMenuOpen ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
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

import { useTranslation } from 'react-i18next';
import { MdLanguage } from 'react-icons/md';

interface LanguageButtonProps {
  onClick: () => void;
}

export const LanguageButton = ({ onClick }: LanguageButtonProps) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      aria-label={t('select-language')}
      className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-bg-gray-2"
    >
      <MdLanguage size={24} />
    </button>
  );
};

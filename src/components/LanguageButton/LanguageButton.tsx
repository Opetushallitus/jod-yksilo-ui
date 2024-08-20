import { MdLanguage } from 'react-icons/md';

interface LanguageButtonProps {
  onLanguageClick: () => void;
}

export const LanguageButton = ({ onLanguageClick }: LanguageButtonProps) => {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-gray-2" onClick={onLanguageClick}>
      <MdLanguage size={24} />
    </button>
  );
};

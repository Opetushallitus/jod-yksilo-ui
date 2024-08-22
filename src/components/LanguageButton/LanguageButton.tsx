interface LanguageButtonProps {
  onLanguageClick: () => void;
}

export const LanguageButton = ({ onLanguageClick }: LanguageButtonProps) => {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-gray-2" onClick={onLanguageClick}>
      <span className="material-symbols-outlined size-24 select-none text-black">language</span>
    </button>
  );
};

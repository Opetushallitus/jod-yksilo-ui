import { RoundButton, useMediaQueries } from '@jod/design-system';
import { MdTune } from 'react-icons/md';

interface FilterButtonProps {
  onClick: () => void;
  label: string;
  hideAfterBreakpoint?: keyof ReturnType<typeof useMediaQueries> | 'none';
  inline?: boolean;
  ref?: React.RefObject<HTMLButtonElement | null>;
}
export const FilterButton = ({
  onClick,
  label,
  hideAfterBreakpoint = 'sm',
  inline = false,
  ref,
}: FilterButtonProps) => {
  const mediaQueries = useMediaQueries();
  const shouldRender = hideAfterBreakpoint === 'none' || !mediaQueries[hideAfterBreakpoint];

  if (!shouldRender) {
    return null;
  }

  return inline ? (
    <button className="cursor-pointer text-form-label flex flex-row items-center gap-x-5" ref={ref} onClick={onClick}>
      <span className="font-arial">{label}</span>
      <span className="flex bg-white rounded-full relative size-7 justify-center items-center">
        <MdTune size={24} />
      </span>
    </button>
  ) : (
    <RoundButton size="sm" bgColor="white" label={label} hideLabel onClick={onClick} icon={<MdTune size={24} />} />
  );
};

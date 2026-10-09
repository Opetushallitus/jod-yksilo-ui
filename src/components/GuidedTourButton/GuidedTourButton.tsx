import { useMediaQueries } from '@jod/design-system';
import { JodWavingHand, JodWavingHandModified } from '@jod/design-system/icons';

import './guided-tour.css';

interface GuidedTourButtonProps {
  /** Visible text of the button */
  text: string;
  /** Accessible name of the button. Must start with the visible text so that voice control works. */
  ariaLabel: string;
  onClick: () => void;
}

export const GuidedTourButton = ({ text, ariaLabel, onClick }: GuidedTourButtonProps) => {
  const { reduceMotion } = useMediaQueries();

  return (
    <button
      type="button"
      className="flex cursor-pointer items-center gap-3 rounded-sm bg-bg-gray-2 px-3 py-2 text-accent"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
    >
      <span className="relative block h-6 w-6" aria-hidden>
        {reduceMotion ? (
          <JodWavingHand size={24} className="absolute inset-0 h-full w-full" />
        ) : (
          <>
            <JodWavingHand size={24} className="absolute inset-0 h-full w-full animate-[showA_3s_infinite]" />
            <JodWavingHandModified
              size={24}
              className="absolute inset-0 h-full w-full origin-[35%_75%] animate-[showB_3s_infinite,waveRotate_3s_infinite_ease-in-out]"
            />
          </>
        )}
      </span>
      <span>{text}</span>
    </button>
  );
};

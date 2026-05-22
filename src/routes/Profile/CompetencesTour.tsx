import { driver, PopoverDOM } from 'driver.js';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';

import { useMediaQueries } from '@jod/design-system';
import { JodRemove, JodWavingHand, JodWavingHandModified } from '@jod/design-system/icons';

const tour = driver();

export const CompetencesTour = () => {
  const { t } = useTranslation();
  const { reduceMotion } = useMediaQueries();

  const startTour = () => {
    tour.setConfig({
      animate: !reduceMotion,
      disableActiveInteraction: true,
      showButtons: ['close'],
      doneBtnText: t('tool.tour.buttons.close'),
      steps: [
        {
          element: '#competences-tour-step-1',
          popover: {
            title: t('profile.competences.tour.step-1.title'),
            description: t('profile.competences.tour.step-1.description'),
            side: 'top',
            align: 'end',
          },
        },
      ],
      overlayOpacity: 0.25,
      onPopoverRender: (popoverDom: PopoverDOM) => {
        popoverDom.closeButton.ariaLabel = t('close');
        const root = createRoot(popoverDom.closeButton);
        root.render(<JodRemove size={18} className="text-white!" />);
      },
    });
    tour.drive();
  };

  return (
    <button
      className="flex cursor-pointer items-center gap-3 rounded-sm bg-bg-gray-2 px-3 py-2 text-accent"
      onClick={startTour}
      aria-haspopup="true"
      aria-label={t('profile.competences.tour.view-guided-tour-label')}
    >
      <div className="relative h-6 w-6">
        <JodWavingHand size={24} className="absolute inset-0 h-full w-full animate-[showA_3s_infinite]" />
        <JodWavingHandModified
          size={24}
          className="absolute inset-0 h-full w-full origin-[35%_75%] animate-[showB_3s_infinite,waveRotate_3s_infinite_ease-in-out]"
        />
      </div>
      <div>{t('profile.competences.tour.view-guided-tour')}</div>
    </button>
  );
};

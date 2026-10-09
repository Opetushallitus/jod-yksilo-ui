import { driver, PopoverDOM } from 'driver.js';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';

import { useMediaQueries } from '@jod/design-system';
import { JodRemove } from '@jod/design-system/icons';

import { GuidedTourButton } from '@/components';

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
    <GuidedTourButton
      text={t('profile.competences.tour.view-guided-tour')}
      ariaLabel={t('profile.competences.tour.view-guided-tour-label')}
      onClick={startTour}
    />
  );
};

import { driver, PopoverDOM, type DriveStep } from 'driver.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';

import { useMediaQueries } from '@jod/design-system';
import { JodRemove } from '@jod/design-system/icons';

import { GuidedTourButton } from '@/components';

interface OnboardingTourProps {
  setOnboardingTourActive: (active: boolean) => void;
  setCurrentTab: (tab: 'info' | 'opportunities') => void;
}

const tour = driver();
const WAIT_AFTER_TAB_CHANGE_MS = 100;
export const OnboardingTour = ({ setOnboardingTourActive, setCurrentTab }: OnboardingTourProps) => {
  const { t } = useTranslation();
  const { lg, reduceMotion } = useMediaQueries();

  const prevLg = React.useRef(lg);

  const getSteps: () => DriveStep[] = () => {
    if (lg) {
      return [
        {
          element: '#tool-your-info-group-1',
          popover: {
            title: t('tool.tour.desktop.step-1.title'),
            description: t('tool.tour.desktop.step-1.description'),
            side: 'top',
            align: 'center',
            showButtons: ['next', 'close'],
          },
        },
        {
          element: '#tool-update-opportunities-button',
          popover: {
            title: t('tool.tour.desktop.step-2.title'),
            description: t('tool.tour.desktop.step-2.description'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tool-your-opportunities-list',
          popover: {
            title: t('tool.tour.desktop.step-3.title'),
            description: t('tool.tour.desktop.step-3.description'),
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '[data-testid="open-tool-settings"]',
          popover: {
            title: t('tool.tour.desktop.step-4.title'),
            description: t('tool.tour.desktop.step-4.description'),
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '#tool-your-info',
          popover: {
            title: t('tool.tour.desktop.step-5.title'),
            description: t('tool.tour.desktop.step-5.description'),
            side: 'right',
            align: 'center',
          },
        },
      ];
    } else {
      return [
        {
          element: '#tool-tabs',
          popover: {
            title: t('tool.tour.mobile.step-1.title'),
            description: t('tool.tour.mobile.step-1.description'),
            side: 'bottom',
            align: 'center',
            showButtons: ['next', 'close'],
            onNextClick: () => {
              setCurrentTab('info');
              setTimeout(() => {
                tour.moveNext();
              }, WAIT_AFTER_TAB_CHANGE_MS);
            },
          },
        },
        {
          element: '#tool-your-info-group-1',
          popover: {
            title: t('tool.tour.mobile.step-2.title'),
            description: t('tool.tour.mobile.step-2.description'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#tool-update-opportunities-button',
          popover: {
            title: t('tool.tour.mobile.step-3.title'),
            description: t('tool.tour.mobile.step-3.description'),
            side: 'top',
            align: 'center',
            onNextClick: () => {
              setCurrentTab('opportunities');
              setTimeout(() => {
                tour.moveNext();
              }, WAIT_AFTER_TAB_CHANGE_MS);
            },
          },
        },
        {
          element: '#tool-your-opportunities-list',
          popover: {
            title: t('tool.tour.mobile.step-4.title'),
            description: t('tool.tour.mobile.step-4.description'),
            side: 'top',
            align: 'center',
            onPrevClick: () => {
              setCurrentTab('info');
              setTimeout(() => {
                tour.movePrevious();
              }, WAIT_AFTER_TAB_CHANGE_MS);
            },
          },
        },
        {
          element: '[data-testid="open-tool-settings"]',
          popover: {
            title: t('tool.tour.mobile.step-5.title'),
            description: t('tool.tour.mobile.step-5.description'),
            side: 'left',
            align: 'center',
            onNextClick: () => {
              setCurrentTab('info');
              setTimeout(() => {
                tour.moveNext();
              }, WAIT_AFTER_TAB_CHANGE_MS);
            },
          },
        },
        {
          element: '#tool-your-info',
          popover: {
            title: t('tool.tour.mobile.step-6.title'),
            description: t('tool.tour.mobile.step-6.description'),
            side: 'top',
            align: 'center',
            onPrevClick: () => {
              setCurrentTab('opportunities');
              setTimeout(() => {
                tour.movePrevious();
              }, WAIT_AFTER_TAB_CHANGE_MS);
            },
          },
        },
      ];
    }
  };

  const startTour = () => {
    setOnboardingTourActive(true);
    const steps = getSteps();
    tour.setConfig({
      animate: !reduceMotion,
      showProgress: true,
      disableActiveInteraction: true,
      progressText: '{{current}}/{{total}}',
      doneBtnText: t('tool.tour.buttons.close'),
      nextBtnText: t('tool.tour.buttons.next'),
      prevBtnText: t('tool.tour.buttons.previous'),
      steps: steps,
      overlayOpacity: 0.25,
      onDestroyed: () => {
        setOnboardingTourActive(false);
      },
      onPopoverRender: (popoverDom: PopoverDOM) => {
        popoverDom.closeButton.ariaLabel = t('close');
        const root = createRoot(popoverDom.closeButton);
        root.render(<JodRemove size={18} className="text-white!" />);
      },
      onHighlighted: (_element, _step, d) => {
        if (!lg && (d.state.activeIndex === 3 || d.state.activeIndex === 5)) {
          window.scrollTo({ top: 300, behavior: 'instant' });
        }
      },
    });
    tour.drive();
  };

  React.useEffect(() => {
    if (lg !== prevLg.current && tour.isActive()) {
      prevLg.current = lg;
      tour.destroy();
    }
    return () => {
      if (tour.isActive()) {
        tour.destroy();
      }
    };
  }, [lg]);

  return (
    <GuidedTourButton
      text={t('tool.tour.view-guided-tour')}
      ariaLabel={t('tool.tour.view-guided-tour-label')}
      onClick={startTour}
    />
  );
};

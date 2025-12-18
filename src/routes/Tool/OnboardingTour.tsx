import { useMediaQueries } from '@jod/design-system';
import { JodRemove, JodWavingHand, JodWavingHandModified } from '@jod/design-system/icons';
import { driver, PopoverDOM, type DriveStep } from 'driver.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import './onboarding-tour.css';

interface OnboardingTourProps {
  setOnboardingTourActive: (active: boolean) => void;
  setCurrentTab: (tab: 'info' | 'opportunities') => void;
}

const tour = driver();
const WAIT_AFTER_TAB_CHANGE_MS = 100;
export const OnboardingTour = ({ setOnboardingTourActive, setCurrentTab }: OnboardingTourProps) => {
  const { t } = useTranslation();
  const { lg } = useMediaQueries();

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
          element: '#tool-your-info-group-2',
          popover: {
            title: t('tool.tour.desktop.step-2.title'),
            description: t('tool.tour.desktop.step-2.description'),
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '[data-testid="update-opportunities"]',
          popover: {
            title: t('tool.tour.desktop.step-3.title'),
            description: t('tool.tour.desktop.step-3.description'),
            side: 'left',
            align: 'center',
          },
        },
        {
          element: '#tool-your-opportunities-list',
          popover: {
            title: t('tool.tour.desktop.step-4.title'),
            description: t('tool.tour.desktop.step-4.description'),
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '[data-testid="open-tool-settings"]',
          popover: {
            title: t('tool.tour.desktop.step-5.title'),
            description: t('tool.tour.desktop.step-5.description'),
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '#tool-your-info',
          popover: {
            title: t('tool.tour.desktop.step-6.title'),
            description: t('tool.tour.desktop.step-6.description'),
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
          element: '#tool-your-info-group-2',
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
          element: '[data-testid="update-opportunities"]',
          popover: {
            title: t('tool.tour.mobile.step-4.title'),
            description: t('tool.tour.mobile.step-4.description'),
            side: 'bottom',
            align: 'end',
            onPrevClick: () => {
              setCurrentTab('info');
              setTimeout(() => {
                tour.movePrevious();
              }, WAIT_AFTER_TAB_CHANGE_MS);
            },
          },
        },
        {
          element: '#tool-your-opportunities-list',
          popover: {
            title: t('tool.tour.mobile.step-5.title'),
            description: t('tool.tour.mobile.step-5.description'),
            side: 'top',
            align: 'center',
            onPopoverRender: () => {
              window.scrollTo({ top: 400, behavior: 'instant' });
              setTimeout(() => {
                tour.refresh();
              }, 200);
            },
          },
        },
        {
          element: '[data-testid="open-tool-settings"]',
          popover: {
            title: t('tool.tour.mobile.step-6.title'),
            description: t('tool.tour.mobile.step-6.description'),
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
            title: t('tool.tour.mobile.step-7.title'),
            description: t('tool.tour.mobile.step-7.description'),
            side: 'top',
            align: 'center',
            onPrevClick: () => {
              setCurrentTab('opportunities');
              setTimeout(() => {
                tour.movePrevious();
              }, WAIT_AFTER_TAB_CHANGE_MS);
            },
            onPopoverRender: () => {
              window.scrollTo({ top: 450, behavior: 'instant' });
              setTimeout(() => {
                tour.refresh();
              }, 200);
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
      animate: true,
      showProgress: true,
      disableActiveInteraction: true,
      progressText: '{{current}}/{{total}}',
      doneBtnText: t('tool.tour.buttons.done'),
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
    <span className="block mt-6">
      <button
        className="cursor-pointer bg-bg-gray-2 text-accent flex items-center gap-3 px-3 py-2 rounded-sm"
        onClick={startTour}
        aria-label={t('tool.tour.view-guided-tour-label')}
      >
        <div className="relative w-6 h-6">
          <JodWavingHand size={24} className="absolute inset-0 w-full h-full animate-[showA_3s_infinite]" />
          <JodWavingHandModified
            size={24}
            className="absolute inset-0 w-full h-full origin-[35%_75%] [animation:showB_3s_infinite,waveRotate_3s_infinite_ease-in-out]"
          />
        </div>
        <div>{t('tool.tour.view-guided-tour')}</div>
      </button>
    </span>
  );
};

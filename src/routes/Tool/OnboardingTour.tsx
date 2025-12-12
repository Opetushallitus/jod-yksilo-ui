import { useMediaQueries } from '@jod/design-system';
import { JodRemove } from '@jod/design-system/icons';
import { driver, PopoverDOM, type DriveStep } from 'driver.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Trans, useTranslation } from 'react-i18next';

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
          popover: {
            title: t('tool.tour.desktop.step-6.title'),
            description: t('tool.tour.desktop.step-6.description'),
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
    <span className="block mt-3">
      <Trans
        i18nKey="tool.tour.view-guided-tour"
        components={{
          StartTour: (
            <button
              className="cursor-pointer text-accent"
              onClick={startTour}
              aria-label={t('tool.tour.view-guided-tour-label')}
            />
          ),
        }}
      />
    </span>
  );
};

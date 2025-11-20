import { useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

import betaPlanImageDesktopFi from '@/../assets/gra_front_timeline_2.svg';
import betaPlanImageDesktopSv from '@/../assets/gra_front_timeline_2_sv.svg';
import betaPlanImageMobileFi from '@/../assets/gra_front_timeline_mob_2.svg';
import betaPlanImageMobileSv from '@/../assets/gra_front_timeline_mob_2_sv.svg';

export const TimelineImage = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { md } = useMediaQueries();

  const imageToUse = React.useMemo(() => {
    switch (language) {
      case 'fi':
        return md ? betaPlanImageDesktopFi : betaPlanImageMobileFi;
      case 'sv':
        return md ? betaPlanImageDesktopSv : betaPlanImageMobileSv;
      default:
        return md ? betaPlanImageDesktopFi : betaPlanImageMobileFi;
    }
  }, [md, language]);

  return (
    <div className="flex justify-center aspect-auto">
      {<img className="max-w-[372px] md:max-w-full" src={imageToUse} alt={t('home.beta')} />}
    </div>
  );
};
